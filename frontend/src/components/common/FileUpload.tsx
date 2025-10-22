import Dropzone from 'react-dropzone'
import api from '../../api/axios';

interface FileUploadProps {
  onImageChange: (images: string[]) => void;
  images: string[];
}

const FileUpload = ({ onImageChange, images }: FileUploadProps) => {
  const handleDrop = async (acceptedFiles: File[]) => {
    let formData = new FormData()

    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }

    formData.append('file', acceptedFiles[0])

    try {
      const response = await api.post('/api/products/image', formData, config)
      console.log('Upload response:', response.data)
      onImageChange([...images, response.data.fileName]);
    } catch (error) {
      console.error('Upload error:', error)
    }

  };

  const handleDelete = async (image: string) => {
    const currentIndex = images.indexOf(image);
    let newImages = [...images];
    newImages.splice(currentIndex, 1);
    onImageChange(newImages)
  }

  return (
    <div className='flex gap-4'>
      <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <section
            className='min-w-[300px] h-[300px] border flex items-center justify-center overflow-x-scroll overflow-y-hidden'
          >
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className='text-3xl'>+</p>
            </div>
          </section>
        )}
      </Dropzone>
      <div className='flex-grow h-[300px] border flex items-center justify-center overflow-x-scroll overflow-y-hidden'>
        {images.map((image) => (
          <div key={image} onClick={() => handleDelete(image)}>
            <img
              src={`${import.meta.env.VITE_API_URL}/${image}`}
              alt={image}
              className='max-h-full object-contain'
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload
