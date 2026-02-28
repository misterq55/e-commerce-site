interface SearchInputProps {
  searchTerm?: string
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const SearchInput = ({ searchTerm, onSearch }: SearchInputProps) => {
  return (
    <input
      className='p-2 border border-gray-300 rounded-md'
      type='text'
      placeholder="검색하세요."
      onChange={onSearch}
      value={searchTerm}
    />
  )
}

export default SearchInput
