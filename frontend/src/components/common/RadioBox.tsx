interface Price {
  _id: number
  name: string
  array: number[]
}

interface RadioBoxProps {
  prices: Price[]
  checkedPrice: number[]
  onFilters: (priceArray: number[]) => void
}

const RadioBox = ({ prices, checkedPrice, onFilters }: RadioBoxProps) => {
  const handleChange = (priceArray: number[]) => {
    onFilters(priceArray)
  }

  const isChecked = (array: number[]) => {
    return JSON.stringify(checkedPrice) === JSON.stringify(array)
  }

  return (
    <div className="p-2 mb-3 bg-gray-100 rounded-md">
      {prices?.map(price => (
         <div key={price._id}>
          <input
            type='radio'
            name='price'
            checked={isChecked(price.array)}
            onChange={() => handleChange(price.array)}
          />
          {" "}
          <label>{price.name}</label>
         </div>
      ))}
    </div>
  )
}

export default RadioBox
