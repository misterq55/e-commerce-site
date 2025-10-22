import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

interface ImageSliderProps {
      images: string[];
  }

const ImageSlider = ({ images }: ImageSliderProps) => {
    return (
        <Carousel autoPlay showThumbs={false} infiniteLoop>
            {images.map(image => (
                <div key={image}>
                    <img 
                        src={`${import.meta.env.VITE_API_URL}/${image}`}
                        alt={image}
                        className='w-full max-h-[150px]'
                    />
                </div>
            ))}
        </Carousel>
    )
}

export default ImageSlider
