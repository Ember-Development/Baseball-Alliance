import React from "react";

interface Props {
  title: string;
  imageUrl: string;
}

const ImageCard: React.FC<Props> = ({ title, imageUrl }) => (
  <div className="rounded-xl overflow-hidden bg-white/5">
    <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
    <div className="p-4">{title}</div>
  </div>
);

export default ImageCard;
