import { useRef, useState } from "react";

import { Input } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton } from "@components/atoms/defaultElements";
import { CommentIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import type { IComment } from "@services/generalType/type";
import { showSuccessToast } from "@utils/core";

import { Comment } from "./comment";
import type { IProps } from "./type";

export default function YearComments({ repoId, referId }: IProps) {
  const t = useTranslations();

  const [comment, setComment] = useState("");
  const [commentId, setCommentId] = useState<number | null>(null);
  const [triggeredId, setTriggeredId] = useState<number | null>(null);
  const commentDescriptionRef = useRef(null);

  const { data: comments, refetch } = useGetData<IComment[], null>({
    url: "/api/comment/select/cmt",
    body: {
      RepoViewId: 40001,
      RepoId: repoId,
      ReferId: referId,
    },

    skip: !referId || !repoId,
  });

  const [addComment] = useCUDDataMutation();

  const handleReset = () => {
    setComment("");
    setCommentId(null);
  };

  const handleAddComment = (id: number) => {
    commentDescriptionRef.current.focus();
    setCommentId(id);
  };

  const handleEditComment = (id: number) => {
    // console.log(id);
  };
  const handleDeleteComment = (id: number) => {
    // console.log(id);
  };

  const onSubmit = async () => {
    if (comment && commentId) {
      try {
        const replyCommentResponse = await addComment({
          url: "/api/comment/insert/cmt",
          body: {
            // DisabledControls: ["string"],
            // DisabledWarnings: ["string"],
            ReturnInsertedRow: false,
            CommentDesc: comment,
            RepoId: repoId,
            ReferId: referId,
            ReplyId: commentId,
          },
          id: commentId,
        }).unwrap();
        if (replyCommentResponse?.Result === "Success") {
          showSuccessToast(t("toast.save"));
          comments.Data.find((item: IComment) => item.CommentId === commentId)
            ?.UsedCount === 0 && refetch();
          setTriggeredId(commentId);
          handleReset();
        }
      } catch (error) {
        null;
      }
    } else if (comment) {
      try {
        const addNewCommentResponse = await addComment({
          url: "/api/comment/insert/cmt",
          body: {
            // DisabledControls: ["string"],
            // DisabledWarnings: ["string"],
            ReturnInsertedRow: false,
            CommentDesc: comment,
            RepoId: repoId,
            ReferId: referId,
          },
        }).unwrap();
        if (addNewCommentResponse?.Result === "Success") {
          showSuccessToast(t("toast.save"));
          handleReset();
        }
      } catch (error) {
        null;
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex items-center gap-2">
        <CommentIcon />
        <span className="text-sm">{t("general.comments")}</span>
      </div>
      <Input
        className="!bg-gray-gray3 dark:!bg-gray-gray10 !border-1 !border-gray-gray3 rounded w-full h-[2.125rem]"
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        ref={commentDescriptionRef}
      />
      <div className="flex justify-end">
        <CustomButton
          type="text"
          className="bg-gray-gray95 !hover:bg-gray-gray5 rounded text-white"
          onClick={onSubmit}
        >
          {t("general.send")}
        </CustomButton>
      </div>
      <div className="overflow-y-auto h-[140px] hidden-show-scrollbar ">
        {comments?.Data?.map((comment: IComment) => (
          <div
            className="p-2 border border-1 rounded-lg mb-2 "
            key={comment.CommentId}
          >
            <Comment
              key={comment.CommentId}
              {...comment}
              handleAddComment={handleAddComment}
              handleDeleteComment={handleDeleteComment}
              handleEditComment={handleEditComment}
              triggeredId={triggeredId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
