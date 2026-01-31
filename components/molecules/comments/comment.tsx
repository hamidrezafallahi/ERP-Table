import { useEffect, useState } from "react";

import { Spin } from "antd";

import {
  CustomButton,
  CustomDropdownButton,
} from "@components/atoms/defaultElements";
import {
  Close,
  Dots,
  EditPencil,
  ReplyIcon,
  SpinIcon,
  TrashBin,
} from "@components/atoms/iconComponents";
import { useGetData } from "@services/base";
import type { IComment } from "@services/generalType/type";

interface IProps extends IComment {
  handleAddComment: (id: number) => void;
  handleEditComment: (id: number) => void;
  handleDeleteComment: (id: number) => void;
  triggeredId: number | null;
}

export const Comment = ({
  CommentId,
  CommentDesc,
  CreateDate,
  RepoId,
  ReferId,
  CreateUserId,
  User,
  ReplyCount,
  UsedCount,
  handleAddComment,
  handleEditComment,
  handleDeleteComment,
  triggeredId,
}: IProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const {
    data: replies,
    isSuccess,
    isLoading,
    refetch,
  } = useGetData<IComment[], null>({
    url: "/api/comment/select/cmt",
    body: {
      RepoViewId: 40001,
      RepoId: RepoId,
      ReferId: ReferId,
      FatherId: CommentId,
    },
    id: CommentId,

    skip: !showReplies,
  });

  // const [getReplies,  { data: replies, isSuccess, isLoading }] =
  //   useGetConditionallyMutation();

  const time = new Date(CreateDate);

  const handleShowReplies = () => {
    setShowReplies(true);
    // getReplies({
    //   url: "/api/comment/select/cmt",
    //   body: {
    //     RepoViewId: 40001,
    //     RepoId: RepoId,
    //     ReferId: ReferId,
    //     FatherId: CommentId,
    //   },
    //   id: CommentId,
    // }).unwrap();
  };

  const handleHideReplies = () => {
    setShowReplies(false);
  };

  useEffect(() => {
    if (triggeredId && showReplies) {
      replies?.Data?.find(
        (comment: IComment) => comment.CommentId === triggeredId
      )?.UsedCount === 0 && refetch();
    }
  }, [triggeredId]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-gray-gray5 rounded-full w-10 h-10"></span>
          <span className="text-xs">{User?.FullName}</span>
          <span className="mx-4 text-[10px]">
            {time.getHours()}:{time.getMinutes().toString().padStart(2, "0")}
          </span>
          <span
            onClick={() => handleAddComment(CommentId)}
            className="cursor-pointer"
          >
            <ReplyIcon />
          </span>
        </div>
      </div>
      <span className="ps-12 text-xs">{CommentDesc}</span>
      {UsedCount > 0 && (
        <>
          {!showReplies ? (
            <CustomButton
              className="flex self-end w-fit !h-5 text-3xl cursor-pointer"
              type="text"
              onClick={handleShowReplies}
            >
              ...
            </CustomButton>
          ) : (
            <CustomButton
              className="flex self-end w-fit !h-5 text-3xl cursor-pointer"
              type="text"
              onClick={handleHideReplies}
            >
              <Close config={{ width: 12, height: 12 }} />
            </CustomButton>
          )}
          {isLoading && <Spin size="large" indicator={<SpinIcon />} />}
          {showReplies && isSuccess && (
            <div className="flex flex-col ps-4 pt-2">
              {replies?.Data?.map((comment: IComment) => (
                <Comment
                  key={comment.CommentId}
                  {...comment}
                  handleAddComment={handleAddComment}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  triggeredId={triggeredId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
