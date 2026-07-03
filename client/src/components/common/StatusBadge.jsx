/**
 * Status badge for Subject statuses and roles.
 * Props: status (string), size ('sm' | default)
 */
import { SUBJECT_STATUS_LABELS, ROLE_LABELS } from '../../utils/statusLabels';

const STATUS_CONFIG = {
  Draft:       { class: 'badge-draft',       label: SUBJECT_STATUS_LABELS.Draft },
  Published:   { class: 'badge-published',   label: SUBJECT_STATUS_LABELS.Published },
  Unpublished: { class: 'badge-unpublished', label: SUBJECT_STATUS_LABELS.Unpublished },
  Inactive:    { class: 'badge-inactive',    label: SUBJECT_STATUS_LABELS.Inactive },
  Admin:       { class: 'badge-admin',       label: ROLE_LABELS.Admin },
  Expert:      { class: 'badge-expert',      label: ROLE_LABELS.Expert },
  Customer:    { class: 'badge-customer',    label: ROLE_LABELS.Customer },
  Marketing:   { class: 'badge-admin',       label: ROLE_LABELS.Marketing },
  Sale:        { class: 'badge-customer',    label: ROLE_LABELS.Sale },
};


const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { class: 'badge-draft', label: status };
  return (
    <span className={`badge ${config.class}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
