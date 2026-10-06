function ConfirmModal({
  show,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  onCancel,
  onConfirm,
}) {
  if (!show) {
    return null;
  }

  return (
    <div className="confirm-overlay">

      <div className="confirm-modal">

        <h2>
          {title}
        </h2>

        <p>
          {message}
        </p>

        <div className="confirm-buttons">

          <button
            type="button"
            className="confirm-cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-delete-button"
            onClick={onConfirm}
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default ConfirmModal;