import { type CommentRefType, type CommentType } from '@prisma/client';
import { useSetAtom } from 'jotai';
import { ArrowRight, Loader2, Pin } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ErrorInfo } from '@/components/shared/ErrorInfo';
import { Loading } from '@/components/shared/Loading';
import { Button } from '@/components/ui/button';
import { ExternalImage } from '@/components/ui/cloudinary-image';
import type { Comment } from '@/interface/comments';
import { type User } from '@/interface/user';
import { api } from '@/lib/api';
import { cn } from '@/utils/cn';

import { validUsernamesAtom } from '../atoms';
import { Comment as CommentUI } from './Comment';
import { CommentForm } from './CommentForm';

interface Props {
  refId: string;
  refType: CommentRefType;
  sponsorId: string | undefined;
  powAuthorId?: string;
  poc: User | undefined;
  submissionAuthor: User | undefined;
  hideCount?: boolean;
  listingType: string;
  listingSlug: string;
  isAnnounced: boolean;
  isVerified?: boolean;
  count: number;
  take?: number;
  type?: CommentType;
  setCount: Dispatch<SetStateAction<number>>;
  isTemplate?: boolean;
  onSuccess?: (newComment: Comment & { author: User }) => void;
  onCommentsChanged?: (comments: Comment[]) => void;
  isDisabled?: boolean;
}
export const Comments = ({
  refId,
  refType,
  sponsorId,
  powAuthorId,
  poc,
  submissionAuthor,
  hideCount = false,
  listingType,
  listingSlug,
  isAnnounced,
  type,
  isVerified = false,
  isTemplate = false,
  isDisabled = false,
  count,
  take = 10,
  setCount,
  onCommentsChanged,
  onSuccess,
}: Props) => {
  const posthog = usePostHog();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [defaultSuggestions, setDefaultSuggestions] = useState<
    Map<string, User>
  >(new Map());
  const setValidUsernames = useSetAtom(validUsernamesAtom);

  const deleteComment = async (commentId: string) => {
    posthog.capture('delete_comment');
    const commentIndex = comments.findIndex(
      (comment) => comment.id === commentId,
    );
    if (commentIndex > -1) {
      await api.delete(`/api/comment/${commentId}/delete`);
      setComments((prevComments) => {
        const newComments = [...prevComments];
        newComments.splice(commentIndex, 1);
        onCommentsChanged?.(newComments);
        return newComments;
      });
      setCount((count) => count - 1);
    } else {
      throw new Error('Comment not found');
    }
  };

  const getComments = async (skip = 0, take = 10) => {
    setIsLoading(true);
    try {
      const commentsData = await api.get(`/api/comment/${refId}`, {
        params: {
          skip,
          take,
          type,
        },
      });
      const allComments = commentsData.data.result as Comment[];

      const newComments = [...comments, ...allComments];
      setCount(commentsData.data.count);
      setComments(newComments);
      onCommentsChanged?.(newComments);
      setDefaultSuggestions((prevSuggestions) => {
        const newSuggestions = new Map(prevSuggestions);
        if (submissionAuthor && submissionAuthor.id) {
          newSuggestions.set(submissionAuthor.id, submissionAuthor);
        }
        if (poc && poc.id) {
          newSuggestions.set(poc.id, poc);
        }
        allComments.forEach((comment) => {
          newSuggestions.set(comment.authorId, comment.author);
        });
        return newSuggestions;
      });
      setValidUsernames(commentsData.data.validUsernames as string[]);
    } catch (e) {
      setError(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoading) return;
    getComments(0, take);

    window.addEventListener('update-comments', () => {
      getComments();
    });
  }, []);

  const [pinnedComments, unpinnedComments] = useMemo(() => {
    const pinnedComments = comments.filter((comment) => comment.pinnedAt);
    const unpinnedComments = comments.filter((comment) => !comment.pinnedAt);

    return [pinnedComments, unpinnedComments];
  }, [comments]);

  if (isLoading && !comments?.length) return <Loading />;

  if (error) return <ErrorInfo />;

  return (
    <div
      className="flex w-full flex-col items-start gap-4 rounded-xl bg-white"
      id="comments"
    >
      {!hideCount && (
        <div className="flex w-full gap-2 pt-4">
          <ExternalImage
            className="h-5 w-5"
            alt="Comments Icon"
            src={'/icons/comments.svg'}
          />
          <div className="flex gap-2">
            <p className="text-base font-medium text-slate-900">{count}</p>
            <p className="text-base text-slate-900">
              {comments?.length === 1 ? 'Comment' : 'Comments'}
            </p>
          </div>
        </div>
      )}
      <CommentForm
        defaultSuggestions={defaultSuggestions}
        refType={refType}
        refId={refId}
        poc={poc}
        type={type}
        onSuccess={(newComment) => {
          setCount((count) => count + 1);
          const newComments = [newComment, ...comments];
          setComments(newComments);
          onCommentsChanged?.(newComments);
          onSuccess?.(newComment);
        }}
        isTemplate={isTemplate}
        isDisabled={isDisabled}
      />
      {/* Pinned Comments Section */}
      <>
        {pinnedComments.length > 0 && (
          <div className="mb-4 w-full rounded-lg border border-slate-200 p-3">
            <div className="mb-3 flex items-center gap-1 text-slate-500">
              <Pin className="h-4 w-4 -rotate-[35deg]" />
              <p className="text-sm font-medium">Pinned Comments</p>
            </div>
            <div className="flex flex-col gap-5">
              {pinnedComments.map((comment) => (
                <CommentUI
                  isAnnounced={isAnnounced}
                  listingSlug={listingSlug}
                  listingType={listingType}
                  defaultSuggestions={defaultSuggestions}
                  powAuthorId={powAuthorId}
                  key={comment.id}
                  comment={comment}
                  type={type}
                  poc={poc}
                  submissionAuthor={submissionAuthor}
                  sponsorId={sponsorId}
                  refType={refType}
                  refId={refId}
                  deleteComment={deleteComment}
                  isVerified={isVerified}
                  isTemplate={isTemplate}
                  isDisabled={isDisabled}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Comments */}
        <div
          className={cn(
            'flex w-full flex-col items-start gap-5',
            unpinnedComments.length > 0 && 'pb-4',
          )}
        >
          {unpinnedComments.map((comment) => (
            <CommentUI
              isAnnounced={isAnnounced}
              listingSlug={listingSlug}
              listingType={listingType}
              defaultSuggestions={defaultSuggestions}
              powAuthorId={powAuthorId}
              key={comment.id}
              comment={comment}
              type={type}
              poc={poc}
              submissionAuthor={submissionAuthor}
              sponsorId={sponsorId}
              refType={refType}
              refId={refId}
              deleteComment={deleteComment}
              isVerified={isVerified}
              isTemplate={isTemplate}
              isDisabled={isDisabled}
            />
          ))}
        </div>
      </>
      {!!comments.length && comments.length !== count && (
        <div className="flex w-full justify-center rounded-md">
          <Button
            className={cn(
              'text-sm font-normal text-slate-400 hover:bg-slate-400 hover:text-white',
              'disabled:hover:bg-transparent disabled:hover:text-slate-400',
            )}
            disabled={!!isLoading}
            onClick={() => getComments(comments.length)}
            variant="ghost"
          >
            {isLoading ? (
              <>
                <span>Fetching Comments...</span>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <span>Show More Comments</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
