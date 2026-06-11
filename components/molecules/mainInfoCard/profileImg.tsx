import React, { useState } from "react";
import Image from "next/image";
import { ProfileIcon } from "@components/atoms/iconComponents";

interface ProfileImgProps {
  url?: string;
  expirationTime?: number;
}

const ProfileImg = (props: ProfileImgProps) => {
  const { url } = props;
  const [disableImage, setDisableImage] = useState(false);
  const imgBugHandler = () => {
    setDisableImage(true);
  };

  return (
    <div className="bg-gray-gray5 rounded-full overflow-hidden">
      {disableImage ? (
        <ProfileIcon />
      ) : (
        <Image
          onError={imgBugHandler}
          src={url}
          alt="Profile Image"
          width={40}
          height={40}
        />
      )}
    </div>
  );
};

export default ProfileImg;
