import { useEffect, useState } from "react";
import CardItem from "../components/common/CardItem"
import CheckBox from "../components/common/CheckBox"
import RadioBox from "../components/common/RadioBox"
import SearchInput from "../components/common/SearchInput"
import api from "../api/axios";
import type { Product, Filters, FetchProductsParams } from "../types/product";

function LandingPage() {
  const limit = 4;
  const [products, setProducts] = useState<Product[]>([])
  const [skip, _setSkip] = useState(0)
  const [hasMore, _setHasMore] = useState(false)
  const [_filters, _setFilters] = useState<Filters>({
    continents: [],
    price: []
  })

  useEffect(() => {
    fetchProducts({skip, limit})
  }, [])

  const fetchProducts = async ({ skip, limit, loadMore: _loadMore = false, filters = {}, searchTerm = '' }: FetchProductsParams) => {
    const params = {
      skip,
      limit,
      filters,
      searchTerm
    }
    // TODO: API 호출 구현
    try {
      const response = await api.get('/api/products', { params })

      setProducts(response.data.products)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section>
      <div className="text-center m-7">
        <h2 className="text-2xl">상품 사이트</h2>
      </div>

      <div className="flex gap-3">
        <div className="w-1/2">
          <CheckBox />
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
          <button className="px-4 py-2 mt-5 text-white bg-black rounded-md hover:bg-gray-500">
            더 보기
          </button>
        </div>
      }
    </section>
  )
}

export default LandingPage
