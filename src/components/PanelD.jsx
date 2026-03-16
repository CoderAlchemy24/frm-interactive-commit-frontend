import { useEffect, useState } from 'react';
import '../styles/PanelD.css';

export default function PanelD({ comment, user, isVisible, variant, onUpdateClick }) {
  const [draft, setDraft] = useState(comment?.content ?? '');

  const windowWidth = window.innerWidth;
  const panelStyle = windowWidth <= 768
     ? variant === 'A'
       ? { width: '94%', marginLeft: '0px' }
       : { width: '88%', marginLeft: '20px' }
     : variant === 'A'
       ? { width: '720px', marginLeft: '-20px'}
       : { width: '665px', marginLeft: '50px' };

  useEffect(() => {
    setDraft(comment?.content ?? '');
  }, [comment]);

  const updateClickHandler = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft || !onUpdateClick) {
      return;
    }

    onUpdateClick(comment.id, trimmedDraft);
  };

  if (!isVisible) return null;

  return (
    <section className="panelD" style={panelStyle}>
      <img src={user.image.png} alt="User Avatar" className="avatar" />
      <textarea
        className="comment-text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="button" className="button" onClick={updateClickHandler}>
        Update
      </button>
    </section>
  );
}
