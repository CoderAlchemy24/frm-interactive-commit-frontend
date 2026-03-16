import { useEffect, useState } from 'react';
import '../styles/PanelB.css';

export default function PanelB({ user, isVisible, targetId, onReplySubmit, isSubmitting, variant }) {
  const [draft, setDraft] = useState('');
  const windowWidth = window.innerWidth;
  const panelStyle = windowWidth <= 768
     ? variant === 'A'
       ? { width: '94%', marginLeft: '0px' }
       : { width: '88%', marginLeft: '20px' }
     : variant === 'A'
       ? { width: '740px', marginLeft: '-40px'}
       : { width: '675px', marginLeft: '50px' };

  useEffect(() => {
    if (isVisible) {
      setDraft('');
    }
  }, [isVisible, targetId]);

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
    <section className="panelB" style={panelStyle}>
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