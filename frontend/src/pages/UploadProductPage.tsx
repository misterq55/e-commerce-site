import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import FileUpload from '../components/common/FileUpload'

const continents = [
  { key: 1, value: 'Africa' },
  { key: 2, value: 'Europe' },
  { key: 3, value: 'Asia' },
  { key: 4, value: 'North America' },
  { key: 5, value: 'South America' },
  { key: 6, value: 'Austrailia' },
  { key: 7, value: 'Antarctica' },
]

const UploadProductPage = () => {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate()
  const [product, setProduct] = useState({
    title: '',
    description: '',
    price: 0,
    continents: 1,
    images: []
  })

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setProduct(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleImages = (newImages: any) => {
    setProduct(prevState => ({
      ...prevState,
      images: newImages
    }))
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const body = {
      writer: userData.user?.id,
      ...product
    }

    try {
      await api.post('/api/products/', body)
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section className='max-w-2xl mx-auto px-4 py-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold'>상품 업로드</h1>
      </div>

      <form className='space-y-6' onSubmit={handleSubmit}>
        <FileUpload images={product.images} onImageChange={handleImages}/>
        <div className='mt-4'>
          <label htmlFor='title'>이름</label>
          <input
            className='w-full px-4 py-2 bg-white border rounded-md'
            name='title' id='title' onChange={handleChange} value={product.title} />
        </div>
        <div className='mt-4'>
          <label htmlFor='description'>설명</label>
          <input
            className='w-full px-4 py-2 bg-white border rounded-md'
            name='description' id='description' onChange={handleChange} value={product.description} />
        </div>
        <div className='mt-4'>
          <label htmlFor='price'>가격</label>
          <input
            className='w-full px-4 py-2 bg-white border rounded-md'
            name='number' id='price' onChange={handleChange} value={product.price} />
        </div>
        <div className='mt-4'>
          <label htmlFor='continents'>지역</label>
          <select
            className='w-full px-4 mt-2 bg-white border rounded-md'
            name='continents' id='continents' onChange={handleChange} value={product.continents}
          >
            {continents.map(item => (
              <option key={item.key} value={item.key}>{item.value}</option>
            ))}
          </select>
        </div>

        <div className='mt-4'>
          <button
            type='submit'
            className='w-full px-4 text-white bg-black rounded-md hover:bg-gray-700 py-2'>생성하기</button>
        </div>
      </form>
    </section>
  )
}

export default UploadProductPage
