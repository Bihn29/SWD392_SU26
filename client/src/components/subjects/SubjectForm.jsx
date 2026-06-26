import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SUBJECT_STATUS_LABELS } from '../../utils/statusLabels';

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
 *   canChangeStatus – Admin only; hides status for Expert
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
    description: '',
    featured: false,
    status: 'Draft',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

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
            ID Chuyên gia phụ trách <span className="required">*</span>
          </label>
          <input
            id="subject-owner"
            name="owner"
            type="text"
            className={`form-control ${errors.owner ? 'error' : ''}`}
            placeholder="ObjectId của chuyên gia trong MongoDB"
            value={form.owner}
            onChange={handleChange}
          />
          {errors.owner ? (
            <span className="form-error">{errors.owner}</span>
          ) : (
            <span className="form-hint">ObjectId 24 ký tự của MongoDB</span>
          )}
        </div>
      </div>

      {/* ── Thumbnail ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="subject-thumbnail">
          URL Ảnh thu nhỏ
        </label>
        <input
          id="subject-thumbnail"
          name="thumbnail"
          type="url"
          className="form-control"
          placeholder="https://example.com/image.png"
          value={form.thumbnail}
          onChange={handleChange}
        />
        <span className="form-hint">Không bắt buộc. Dán URL ảnh trực tiếp.</span>
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
