import { useEffect, useState } from "react";
import CardItem from "../components/common/CardItem"
import CheckBox from "../components/common/CheckBox"
import RadioBox from "../components/common/RadioBox"
import SearchInput from "../components/common/SearchInput"
import api from "../api/axios";
import type { Product, Filters, FetchProductsParams } from "../types/product";
import { continents } from "../utils/filterData";

function LandingPage() {
  const limit = 4;
  const [products, setProducts] = useState<Product[]>([])
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    continents: [],
    price: []
  })

  useEffect(() => {
    fetchProducts({ skip, limit })
  }, [])

  const fetchProducts = async ({ skip, limit, loadMore = false, filters = {}, searchTerm = '' }: FetchProductsParams) => {
    const params = {
      skip,
      limit,
      filters: JSON.stringify(filters),
      searchTerm
    }

    try {
      const response = await api.get('/api/products', { params })

      if (loadMore) {
        setProducts(prev => [...prev, ...response.data.products])
      } else {
        setProducts(response.data.products)
      }
      setHasMore(response.data.hasMore)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLoadMore = () => {
    const body = {
      skip: skip + limit,
      limit,
      loadMore: true,
      filters
    }
    fetchProducts(body)
    setSkip(skip + limit)
  }

  const handleFilters = (newFilteredData: number[], category: keyof Filters) => {
    const newFilters = {...filters, [category]: newFilteredData}
    showFilteredResults(newFilters)
    setFilters(newFilters)
  }

  const showFilteredResults = (filters: Filters) => {
    const body = {
      skip: 0,
      limit,
      filters
    }

    fetchProducts(body)
    setSkip(0)
  }

  return (
    <section>
      <div className="text-center m-7">
        <h2 className="text-2xl">상품 사이트</h2>
      </div>

      <div className="flex gap-3">
        <div className="w-1/2">
          <CheckBox continents={continents} checkedContinents={filters.continents}
            onFilters={filters => handleFilters(filters, "continents")}
          />
        </div>

        <div className="w-1/2">
          <RadioBox />
        </div>
      </div>

      <div className="flex justify-end">
        <SearchInput />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map(product =>
          <CardItem product={product} key={product.id} />
        )}

      </div>

      {hasMore &&
        <div className="flex justify-center mt-5">
          <button 
            onClick={handleLoadMore}
            className="px-4 py-2 mt-5 text-white bg-black rounded-md hover:bg-gray-500">
            더 보기
          </button>
        </div>
      }
    </section>
  )
}

export default LandingPage
