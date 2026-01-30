const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qr.impaya.online/api/v1"

interface FetchOptions extends RequestInit {
	params?: Record<string, string>
	token?: string | null
}

export class ApiError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public data: any
	) {
		super(`API Error: ${status} ${statusText}`)
	}
}

export const api = {
	async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "GET" })
	},

	async post<T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				...(options.headers as Record<string, string>)
			}
		})
	},

	async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
		const { params, token, ...init } = options

		const url = new URL(`${API_BASE_URL}${endpoint}`)
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value) url.searchParams.append(key, value)
			})
		}

		const headers: HeadersInit = {
			...((init.headers as Record<string, string>) || {})
		}

		if (token) {
			headers["Authorization"] = token
		}

		const response = await fetch(url.toString(), {
			...init,
			headers
		})

		if (!response.ok) {
			let errorData
			try {
				errorData = await response.json()
			} catch {
				errorData = { message: "Unknown error" }
			}
			throw new ApiError(response.status, response.statusText, errorData)
		}

		const json = await response.json()

		return json
	}
}
