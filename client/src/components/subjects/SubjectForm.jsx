import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SUBJECT_STATUS_LABELS } from '../../utils/statusLabels';
import { getUsers } from '../../api/userApi';
import { uploadFile } from '../../api/uploadApi';

const CATEGORIES = [
  'Phát triển Frontend',
  'Phát triển Backend',
  'Phát triển Full Stack',
  'Phát triển Mobile',
  'DevOps & Đám mây',
  'Khoa học dữ liệu',
  'Học máy',
  'Thiết kế UI/UX',
  'An ninh mạng',
  'Cơ sở dữ liệu',
  'Khác',
];

const STATUS_OPTIONS = ['Draft', 'Published', 'Unpublished', 'Inactive'];

/**
 * Reusable Subject form for both Create and Edit.
 * Props:
 *   initialData   – pre-filled data for edit mode
 *   onSubmit      – async handler (data) => void
 *   loading       – disables submit while processing
 *   isEdit        – shows status field when true
 *   canChangeStatus – Admin/Manager only; hides status for Teacher
 */
const SubjectForm = ({
  initialData = {},
  onSubmit,
  loading = false,
  isEdit = false,
  canChangeStatus = true,
}) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: '',
    owner: '',
    thumbnail: '',
    introVideo: '',
    description: '',
    featured: false,
    status: 'Draft',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Fetch teachers for the dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await getUsers({ role: 'Teacher' });
        setTeachers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
      }
    };
    fetchTeachers();
  }, []);

  // Sync when initialData changes (edit mode load)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        owner: initialData.owner?._id || initialData.owner || '',
      }));
    }
  }, [initialData?.name]); // only re-sync when name changes (data loaded)

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'Tên khóa học là bắt buộc.';
    } else if (form.name.length > 150) {
      errs.name = 'Tên khóa học không được vượt quá 150 ký tự.';
    }

    if (!form.category) {
      errs.category = 'Danh mục là bắt buộc.';
    }

    if (!form.owner.trim()) {
      errs.owner = 'ID Chuyên gia phụ trách là bắt buộc.';
    } else if (!/^[a-f\d]{24}$/i.test(form.owner.trim())) {
      errs.owner = 'Chuyên gia phụ trách phải là một ObjectId hợp lệ của MongoDB.';
    }

    if (form.description && form.description.length > 5000) {
      errs.description = 'Mô tả không được vượt quá 5000 ký tự.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadFile(file);
      if (res.data && res.data.url) {
        setForm(prev => ({ ...prev, thumbnail: res.data.url }));
      }
    } catch (err) {
      console.error('Lỗi upload file:', err);
      alert('Không thể upload ảnh, vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const res = await uploadFile(file);
      if (res.data && res.data.url) {
        setForm(prev => ({ ...prev, introVideo: res.data.url }));
      }
    } catch (err) {
      console.error('Lỗi upload video:', err);
      alert('Không thể upload video, vui lòng thử lại.');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Scroll to first error
      const firstErrorEl = document.querySelector('.form-control.error');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Build payload
    const payload = {
      name: form.name.trim(),
      category: form.category,
      owner: form.owner.trim(),
      thumbnail: form.thumbnail?.trim() || '',
      introVideo: form.introVideo?.trim() || '',
      description: form.description?.trim() || '',
      featured: Boolean(form.featured),
    };
    if (isEdit && canChangeStatus) {
      payload.status = form.status;
    }

    await onSubmit(payload);
  };

  const charCount = form.name?.length || 0;
  const descCount = form.description?.length || 0;

  return (
    <form onSubmit={handleSubmit} noValidate id="subject-form">
      {/* ── Name ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="subject-name">
          Tên khóa học <span className="required">*</span>
        </label>
        <input
          id="subject-name"
          name="name"
          type="text"
          className={`form-control ${errors.name ? 'error' : ''}`}
          placeholder="VD: Cơ bản về ReactJS"
          value={form.name}
          onChange={handleChange}
          maxLength={150}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {errors.name ? (
            <span className="form-error">{errors.name}</span>
          ) : (
            <span />
          )}
          <span className={`form-hint ${charCount > 130 ? 'text-warning' : ''}`}>
            {charCount}/150
          </span>
        </div>
      </div>

      {/* ── Category + Owner ── */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="subject-category">
            Danh mục <span className="required">*</span>
          </label>
          <select
            id="subject-category"
            name="category"
            className={`form-control ${errors.category ? 'error' : ''}`}
            value={form.category}
            onChange={handleChange}
          >
            <option value="">— Chọn danh mục —</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="form-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="subject-owner">
            Chuyên gia phụ trách <span className="required">*</span>
          </label>
          <select
            id="subject-owner"
            name="owner"
            className={`form-control ${errors.owner ? 'error' : ''}`}
            value={form.owner}
            onChange={handleChange}
          >
            <option value="">— Chọn chuyên gia phụ trách —</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
          {errors.owner ? (
            <span className="form-error">{errors.owner}</span>
          ) : (
            <span className="form-hint">Chọn giảng viên từ danh sách</span>
          )}
        </div>
      </div>

      {/* ── Thumbnail ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="subject-thumbnail">
          Ảnh thu nhỏ (Thumbnail)
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={uploadingImage}
              style={{ whiteSpace: 'nowrap' }}
            >
              {uploadingImage ? '⏳ Đang tải lên...' : '📁 Chọn ảnh từ máy'}
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploadingImage}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
          {form.thumbnail && (
            <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: '500' }}>
              ✅ Đã có ảnh
            </span>
          )}
        </div>
        <span className="form-hint">Tải ảnh từ máy tính (Tối đa 5MB).</span>
      </div>

      {/* ── Intro Video ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="subject-introVideo">
          Video giới thiệu (Intro Video)
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={uploadingVideo}
              style={{ whiteSpace: 'nowrap' }}
            >
              {uploadingVideo ? '⏳ Đang tải lên...' : '🎬 Chọn video từ máy'}
            </button>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploadingVideo}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
          {form.introVideo && (
            <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: '500' }}>
              ✅ Đã có video
            </span>
          )}
        </div>
        <span className="form-hint">Tải video giới thiệu khóa học từ máy tính (Tối đa 100MB).</span>
      </div>

      {/* ── Description ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="subject-description">
          Mô tả
        </label>
        <textarea
          id="subject-description"
          name="description"
          className={`form-control ${errors.description ? 'error' : ''}`}
          placeholder="Viết một tổng quan ngắn gọn về khóa học này..."
          value={form.description}
          onChange={handleChange}
          rows={5}
          maxLength={5000}
          style={{ minHeight: '120px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {errors.description ? (
            <span className="form-error">{errors.description}</span>
          ) : (
            <span />
          )}
          <span className={`form-hint ${descCount > 4500 ? 'text-warning' : ''}`}>
            {descCount}/5000
          </span>
        </div>
      </div>

      {/* ── Featured + Status ── */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Nổi bật</label>
          <div className="toggle-wrapper">
            <label className="toggle">
              <input
                id="subject-featured"
                name="featured"
                type="checkbox"
                checked={form.featured}
                onChange={handleChange}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {form.featured ? '⭐ Khóa học nổi bật' : 'Không nổi bật'}
            </span>
          </div>
        </div>

        {isEdit && canChangeStatus && (
          <div className="form-group">
            <label className="form-label" htmlFor="subject-status">
              Trạng thái
            </label>
            <select
              id="subject-status"
              name="status"
              className="form-control"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{SUBJECT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Thumbnail preview ── */}
      {form.thumbnail && (
        <div className="form-group">
          <label className="form-label">Xem trước ảnh thu nhỏ</label>
          <img
            src={form.thumbnail}
            alt="Thumbnail preview"
            style={{
              width: '240px',
              height: '135px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* ── Actions ── */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '8px',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          disabled={loading}
          id="subject-form-cancel-btn"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          id="subject-form-submit-btn"
        >
          {loading ? (
            <>
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Đang lưu...
            </>
          ) : (
            isEdit ? '💾 Lưu thay đổi' : '✨ Thêm khóa học'
          )}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
