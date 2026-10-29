import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getSupplierPage, postSupplier, removeSupplier, toApiProblem } from '../api/client'
import type { ApiProblem, Supplier, SupplierInput, SupplierPage } from '../types'

export const PAGE_SIZE = 10

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface SuppliersState {
  data: Supplier[]
  page: number
  totalElements: number
  totalPages: number
  status: LoadStatus
  error: string | null
  requestId: string | null
}

const initialState: SuppliersState = {
  data: [],
  page: 0,
  totalElements: 0,
  totalPages: 0,
  status: 'idle',
  error: null,
  requestId: null,
}

export const fetchSuppliers = createAsyncThunk<
  SupplierPage,
  { page: number; size: number },
  { rejectValue: ApiProblem }
>('suppliers/fetch', async ({ page, size }, { signal, rejectWithValue }) => {
  try {
    let targetPage = page
    while (true) {
      const result = await getSupplierPage(targetPage, size, signal)
      if (targetPage === 0 || targetPage < result.totalPages) return result
      targetPage = Math.max(0, result.totalPages - 1)
    }
  } catch (error) {
    return rejectWithValue(toApiProblem(error))
  }
})

export const createSupplier = createAsyncThunk<
  Supplier,
  SupplierInput,
  { rejectValue: ApiProblem }
>('suppliers/create', async (input, { signal, rejectWithValue }) => {
  try {
    return await postSupplier(input, signal)
  } catch (error) {
    return rejectWithValue(toApiProblem(error))
  }
})

export const deleteSupplier = createAsyncThunk<number, number, { rejectValue: ApiProblem }>(
  'suppliers/delete',
  async (id, { signal, rejectWithValue }) => {
    try {
      await removeSupplier(id, signal)
      return id
    } catch (error) {
      return rejectWithValue(toApiProblem(error))
    }
  },
)

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.page = action.meta.arg.page
        state.requestId = action.meta.requestId
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.data = action.payload.content
        state.page = action.payload.number
        state.totalElements = action.payload.totalElements
        state.totalPages = action.payload.totalPages
        state.status = 'succeeded'
        state.requestId = null
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = action.meta.aborted ? 'idle' : 'failed'
        state.error = action.meta.aborted
          ? null
          : action.payload?.message || action.error.message || 'No se pudo cargar la lista.'
        state.requestId = null
      })
  },
})

export default suppliersSlice.reducer
