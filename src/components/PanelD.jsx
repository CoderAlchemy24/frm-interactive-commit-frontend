import { useState } from 'react';
import '../styles/PanelD.css';

export default function PanelD({ comment, user, isVisible, variant, onUpdateClick }) {
  const [draft, setDraft] = useState(comment?.content ?? '');
  const panelClassName = variant === 'B' ? 'panelD panelD--reply' : 'panelD';

  const updateClickHandler = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft || !onUpdateClick) {
      return;
    }

    onUpdateClick(comment.id, trimmedDraft);
  };

  if (!isVisible) return null;

  return (
    <section className={panelClassName}>
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
