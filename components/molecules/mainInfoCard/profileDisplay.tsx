import React, { ComponentType } from "react";

type ProfileDisplayProps<P = {}> = {
  Component: ComponentType<P>;
  componentProps: P;
};

const ProfileDisplay = <P,>(props: ProfileDisplayProps) => {
  const { Component, componentProps } = props;
  return (
    <div className="flex justify-center items-center bg-main-white rounded-md overflow-hidden">
      <Component {...componentProps} />
    </div>
  );
};

export default ProfileDisplay;
