import { Fragment, useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import PanelA from './components/PanelA';
import PanelB from './components/PanelB';
import PanelC from './components/PanelC';
import PanelD from './components/PanelD';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


function App() {

  const [currentUser, setCurrentUser] = useState({});
  const [comments, setComments] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [requestError, setRequestError] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [activeEditId, setActiveEditId] = useState(null);
  const [pendingVoteIds, setPendingVoteIds] = useState(() => new Set());
  const [pendingReplyIds, setPendingReplyIds] = useState(() => new Set());
  const pendingVoteIdsRef = useRef(new Set());
  const pendingReplyIdsRef = useRef(new Set());

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
      setRequestError('');
      return true;
    } catch (error) {
      console.error('Error fetching comments:', error);
      setRequestError('Unable to load comments right now. Please refresh and try again.');
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);

        if (!response.ok) {
          throw new Error('Failed to fetch current user');
        }

        const data = await response.json();
        if (isMounted) {
          setCurrentUser(data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([fetchCurrentUser(), fetchComments()]);

      if (isMounted) {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchComments]);

 const handleReplyToggle = (id) => {
    setActiveReplyId((prev) => (prev === id ? null : id));
  };

  const handleEditToggle = (id) => {
    setActiveEditId((prev) => (prev === id ? null : id));
  };

  const findCommentLocation = (id) => {
    for (const comment of comments) {
      if (comment.id === id) {
        return { type: 'comment', commentId: comment.id };
      }

      const foundReply = comment.replies?.find((reply) => reply.id === id);

      if (foundReply) {
        return { type: 'reply', commentId: comment.id, replyId: foundReply.id };
      }
    }

    return null;
  };

  const findReplyTarget = (id) => {
    for (const comment of comments) {
      if (comment.id === id) {
        return {
          commentId: comment.id,
          replyingTo: comment.user.username
        };
      }

      const foundReply = comment.replies?.find((reply) => reply.id === id);

      if (foundReply) {
        return {
          commentId: comment.id,
          replyingTo: foundReply.user.username
        };
      }
    }

    return null;
  };

  const handleDelete = async (id) => {
    const location = findCommentLocation(id);

    if (!location) {
      return false;
    }

    const endpoint =
      location.type === 'comment'
        ? `${API_BASE_URL}/comments/${location.commentId}`
        : `${API_BASE_URL}/comments/${location.commentId}/replies/${location.replyId}`;

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      await fetchComments();
      setActiveEditId((prev) => (prev === id ? null : prev));

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  };

  const handleUpdate = async (id, content) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return false;
    }

    const location = findCommentLocation(id);

    if (!location) {
      return false;
    }

    const endpoint =
      location.type === 'comment'
        ? `${API_BASE_URL}/comments/${location.commentId}`
        : `${API_BASE_URL}/comments/${location.commentId}/replies/${location.replyId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: trimmedContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      await fetchComments();
      setActiveEditId(null);

      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      return false;
    }
  };

  const handleVote = async (id, direction) => {
    if (direction !== 'upvote' && direction !== 'downvote') {
      return false;
    }

    if (pendingVoteIdsRef.current.has(id)) {
      return false;
    }

    const location = findCommentLocation(id);

    if (!location) {
      return false;
    }

    const endpoint =
      location.type === 'comment'
        ? `${API_BASE_URL}/comments/${location.commentId}/${direction}`
        : `${API_BASE_URL}/comments/${location.commentId}/replies/${location.replyId}/${direction}`;

    setPendingVoteIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    pendingVoteIdsRef.current.add(id);

    try {
      const response = await fetch(endpoint, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Failed to ${direction}`);
      }

      await fetchComments();
      return true;
    } catch (error) {
      console.error(`Error during ${direction}:`, error);
      return false;
    } finally {
      setPendingVoteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      pendingVoteIdsRef.current.delete(id);
    }
  };

  const handleReplySubmit = async (id, content) => {
    const trimmedContent = content.trim();

    if (!trimmedContent || pendingReplyIdsRef.current.has(id)) {
      return false;
    }

    const target = findReplyTarget(id);

    if (!target) {
      return false;
    }

    setPendingReplyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    pendingReplyIdsRef.current.add(id);

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${target.commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: trimmedContent,
          replyingTo: target.replyingTo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create reply');
      }

      await fetchComments();
      setActiveReplyId(null);

      return true;
    } catch (error) {
      console.error('Error creating reply:', error);
      return false;
    } finally {
      setPendingReplyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      pendingReplyIdsRef.current.delete(id);
    }
  };

  

  const isCurrentUser = (item) =>
    currentUser?.username && currentUser.username === item?.user?.username;

  if (isInitialLoading) {
    return (
      <section className="app app--status">
        <p className="app-status" role="status">Loading comments...</p>
      </section>
    );
  }

 
  return (
    <section className="app">
      {requestError && (
        <p className="app-status app-status--error" role="alert">{requestError}</p>
      )}

      {!requestError && comments.length === 0 && (
        <p className="app-status" role="status">No comments available.</p>
      )}

      {comments.map((comment) => {
        const ownComment = isCurrentUser(comment);

        return (
          <Fragment key={comment.id}>
            {ownComment ? (
              <PanelC
                comment={comment}
                onEditClick={handleEditToggle}
                onDeleteClick={handleDelete}
                onVoteClick={handleVote}
                isVotePending={pendingVoteIds.has(comment.id)}
                variant="A"
              />
            ) : (
              <PanelA
                comment={comment}
                onReplyClick={handleReplyToggle}
                onVoteClick={handleVote}
                isVotePending={pendingVoteIds.has(comment.id)}
                variant="A"
              />
            )}

            {ownComment ? (
              <PanelD
                comment={comment}
                user={currentUser}
                isVisible={activeEditId === comment.id}
                onUpdateClick={handleUpdate}
                variant="A"
              />
            ) : (
              <PanelB
                user={currentUser}
                isVisible={activeReplyId === comment.id}
                targetId={comment.id}
                onReplySubmit={handleReplySubmit}
                isSubmitting={pendingReplyIds.has(comment.id)}
                variant="A"
              />
            )}

            {comment.replies?.length > 0 && (
              <div className="reply-thread">
                {comment.replies.map((reply) => {
                  const ownReply = isCurrentUser(reply);

                  return (
                    <Fragment key={reply.id}>
                      {ownReply ? (
                        <PanelC
                          comment={reply}
                          onEditClick={handleEditToggle}
                          onDeleteClick={handleDelete}
                          onVoteClick={handleVote}
                          isVotePending={pendingVoteIds.has(reply.id)}
                          variant="B"
                        />
                      ) : (
                        <PanelA
                          comment={reply}
                          onReplyClick={handleReplyToggle}
                          onVoteClick={handleVote}
                          isVotePending={pendingVoteIds.has(reply.id)}
                          variant="B"
                        />
                      )}

                      {ownReply ? (
                        <PanelD
                          comment={reply}
                          user={currentUser}
                          isVisible={activeEditId === reply.id}
                          onUpdateClick={handleUpdate}
                          variant="B"
                        />
                      ) : (
                        <PanelB
                          user={currentUser}
                          isVisible={activeReplyId === reply.id}
                          targetId={reply.id}
                          onReplySubmit={handleReplySubmit}
                          isSubmitting={pendingReplyIds.has(reply.id)}
                          variant="B"
                        />
                      )}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </Fragment>
        );
      })}
     
    </section>
  )
}

export default App
