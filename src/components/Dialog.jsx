import '../styles/Dialog.css';

export default function Dialog({ visible, onClose, onConfirm }) {

  const title="Delete comment" ;
  const message="Are you sure you want to delete this item? This will remove the comment and can't be undone."

  return (
    visible && <div className="dialog-overlay">
      <div className="dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className='btns'>
            <button onClick={onClose} className='cancel-btn'>No, cancel</button>
            <button onClick={onConfirm} className='delete-btn'>Yes, delete</button>
        </div>
       
      </div>
    </div>
  );
}