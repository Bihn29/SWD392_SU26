import { SUBJECT_STATUS_LABELS, ROLE_LABELS } from '../../utils/statusLabels';

const STATUS_CONFIG = {
  Draft: { class: 'badge-draft', label: SUBJECT_STATUS_LABELS.Draft },
  Published: { class: 'badge-published', label: SUBJECT_STATUS_LABELS.Published },
  Unpublished: { class: 'badge-unpublished', label: SUBJECT_STATUS_LABELS.Unpublished },
  Inactive: { class: 'badge-inactive', label: SUBJECT_STATUS_LABELS.Inactive },
  Admin: { class: 'badge-admin', label: ROLE_LABELS.Admin },
  Manager: { class: 'badge-admin', label: ROLE_LABELS.Manager },
  Teacher: { class: 'badge-expert', label: ROLE_LABELS.Teacher },
  Student: { class: 'badge-customer', label: ROLE_LABELS.Student },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { class: 'badge-draft', label: status };
  return <span className={`badge ${config.class}`}>{config.label}</span>;
};

export default StatusBadge;
