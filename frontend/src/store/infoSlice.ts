import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApplicationInfo, toApiProblem } from '../api/client'
import type { ApiProblem, ApplicationInfo } from '../types'

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface InfoState {
  data: ApplicationInfo | null
  status: LoadStatus
  error: string | null
  requestId: string | null
}

const initialState: InfoState = {
  data: null,
  status: 'idle',
  error: null,
  requestId: null,
}

export const fetchApplicationInfo = createAsyncThunk<
  ApplicationInfo,
  void,
  { rejectValue: ApiProblem }
>('info/fetch', async (_, { signal, rejectWithValue }) => {
  try {
    return await getApplicationInfo(signal)
  } catch (error) {
    return rejectWithValue(toApiProblem(error))
  }
})

const infoSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationInfo.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(fetchApplicationInfo.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.data = action.payload
        state.status = 'succeeded'
        state.requestId = null
      })
      .addCase(fetchApplicationInfo.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = action.meta.aborted ? 'idle' : 'failed'
        state.error = action.meta.aborted
          ? null
          : action.payload?.message || action.error.message || 'No se pudo cargar la información.'
        state.requestId = null
      })
  },
})

export default infoSlice.reducer
