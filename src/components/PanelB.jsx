import { useState } from 'react';
import '../styles/PanelB.css';

export default function PanelB({ user, isVisible, targetId, onReplySubmit, isSubmitting, variant }) {
  const [draft, setDraft] = useState('');
  const panelClassName = variant === 'B' ? 'panelB panelB--reply' : 'panelB';

  const replyClickHandler = async () => {
    if (!onReplySubmit || isSubmitting) {
      return;
    }

    const isCreated = await onReplySubmit(targetId, draft);

    if (isCreated) {
      setDraft('');
    }
  };

  if (!isVisible) return null;

  return (
    <section className={panelClassName}>
        <img src={user.image.png} alt="User Avatar" className="avatar" />
        <textarea
          className='comment-text'
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        ></textarea>
        <button type="button" className='button' onClick={replyClickHandler} disabled={isSubmitting}>
          Reply
        </button>
    </section>)}