import React from 'react'

interface Props {
  title: string
  imageUrl: string
}

const ImageCard: React.FC<Props> = ({ title, imageUrl }) => (
  <div className="relative h-48 rounded-lg overflow-hidden group cursor-pointer">
    <img
      src={imageUrl}
      alt={title}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
      <h3 className="text-white text-lg font-semibold text-center">{title}</h3>
    </div>
  </div>
)

export default ImageCard
