import React from 'react';
import { PERMISSION_GROUPS } from '../../utils/roleLabels';

const PermissionCheckboxGroup = ({ selectedPermissions, onChange, disabled }) => {
  const handleCheckboxChange = (permId) => {
    if (disabled) return;
    
    // If selecting '*', clear all other permissions. If it's already selected, unselect it.
    if (permId === '*') {
      if (selectedPermissions.includes('*')) {
        onChange([]);
      } else {
        onChange(['*']);
      }
      return;
    }

    // If '*' was selected and we're picking something else, clear '*' first
    let currentPerms = [...selectedPermissions];
    if (currentPerms.includes('*')) {
      currentPerms = [];
    }

    if (currentPerms.includes(permId)) {
      onChange(currentPerms.filter((id) => id !== permId));
    } else {
      onChange([...currentPerms, permId]);
    }
  };

  const handleGroupToggle = (group) => {
    if (disabled) return;
    if (group.key === 'system') {
      handleCheckboxChange('*');
      return;
    }

    const groupPermIds = group.permissions.map((p) => p.id);
    const allSelectedInGroup = groupPermIds.every((id) => selectedPermissions.includes(id));

    let currentPerms = [...selectedPermissions];
    if (currentPerms.includes('*')) {
      currentPerms = [];
    }

    if (allSelectedInGroup) {
      // Unselect group
      onChange(currentPerms.filter((id) => !groupPermIds.includes(id)));
    } else {
      // Select group (add those not already in)
      const newPerms = [...currentPerms];
      groupPermIds.forEach((id) => {
        if (!newPerms.includes(id)) {
          newPerms.push(id);
        }
      });
      onChange(newPerms);
    }
  };

  return (
    <div className="permission-groups-grid">
      {PERMISSION_GROUPS.map((group) => {
        const groupPermIds = group.permissions.map((p) => p.id);
        const allSelected = selectedPermissions.includes('*') || groupPermIds.every((id) => selectedPermissions.includes(id));
        const someSelected = !allSelected && groupPermIds.some((id) => selectedPermissions.includes(id));

        return (
          <div key={group.key} className="permission-group-card">
            <div className="permission-group-header">
              <input
                type="checkbox"
                id={`group-${group.key}`}
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={() => handleGroupToggle(group)}
                disabled={disabled}
              />
              <label htmlFor={`group-${group.key}`}>
                {group.label}
              </label>
            </div>
            
            <div className="permission-group-list">
              {group.permissions.map((perm) => (
                <label
                  key={perm.id}
                  className="permission-checkbox-label"
                  style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes('*') || selectedPermissions.includes(perm.id)}
                    onChange={() => handleCheckboxChange(perm.id)}
                    disabled={disabled || (selectedPermissions.includes('*') && perm.id !== '*')}
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionCheckboxGroup;
