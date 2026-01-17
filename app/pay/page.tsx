"use client"

import { Suspense, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
	CreditCard,
	Calendar,
	Lock,
	ArrowRight,
	Camera,
	Image as ImageIcon,
	X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function PayContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const amount = searchParams.get("amount") || "0.00"
	const recipient = searchParams.get("recipient") || "Merchant"
	const [isProcessing, setIsProcessing] = useState(false)
	const [showScanModal, setShowScanModal] = useState(false)
	const [scanError, setScanError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const galleryInputRef = useRef<HTMLInputElement>(null)

	const [formData, setFormData] = useState({
		cardNumber: "",
		expiry: "",
		cvv: ""
	})

	const [errors, setErrors] = useState({
		cardNumber: "",
		expiry: "",
		cvv: ""
	})

	const formatCardNumber = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
		const parts = []
		for (let i = 0; i < v.length; i += 4) {
			parts.push(v.substring(i, i + 4))
		}
		return parts.length > 1 ? parts.join(" ") : value
	}

	const formatExpiry = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
		if (v.length >= 2) {
			return v.substring(0, 2) + "/" + v.substring(2, 4)
		}
		return v
	}

	const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setIsProcessing(true)
		setScanError(null)
		try {
			const reader = new FileReader()
			reader.onloadend = async () => {
				const base64 = reader.result?.toString()
				if (!base64) {
					setScanError("Failed to read file")
					setIsProcessing(false)
					return
				}

				try {
					const res = await fetch("https://demo.vibo.tips/api/terminal/bill/recognize", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization:
								"Basic: 56d3b2c2f25b74b2229c625c2904b3ac99345c0f049ca23e4cc18df52d7"
						},
						body: JSON.stringify({
							file: base64,
							model: "gemini"
						})
					})

					if (!res.ok) {
						throw new Error(`API error: ${res.status}`)
					}

					const { data } = await res.json()
					console.log("Scan result:", data)

					if (data?.card?.number) {
						setFormData((prev) => ({
							...prev,
							cardNumber: data.card.number
								? formatCardNumber(data.card.number)
								: prev.cardNumber,
							expiry: data.card.expDate ? formatExpiry(data.card.expDate) : prev.expiry
						}))
						setShowScanModal(false)
					} else {
						setScanError("Could not recognize card details. Please try again.")
					}
				} catch (err) {
					console.error("Scan error", err)
					setScanError("Failed to process image. Please try again.")
				} finally {
					setIsProcessing(false)
				}
			}
			reader.readAsDataURL(file)
		} catch (error) {
			console.error("File reading error", error)
			setScanError("Failed to load image")
			setIsProcessing(false)
		}
	}

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		let formattedValue = value

		if (name === "cardNumber") {
			formattedValue = formatCardNumber(value)
		} else if (name === "expiry") {
			formattedValue = formatExpiry(value)
		} else if (name === "cvv") {
			formattedValue = value.replace(/\D/g, "")
		}

		setFormData((prev) => ({ ...prev, [name]: formattedValue }))
		// Clear error when user types
		if (errors[name as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [name]: "" }))
		}
	}

	const validate = () => {
		let isValid = true
		const newErrors = {
			cardNumber: "",
			expiry: "",
			cvv: ""
		}

		if (formData.cardNumber.replace(/\s/g, "").length < 16) {
			newErrors.cardNumber = "Invalid card number"
			isValid = false
		}

		if (formData.expiry.length < 5) {
			newErrors.expiry = "Invalid date"
			isValid = false
		} else {
			const [month, year] = formData.expiry.split("/")
			const m = parseInt(month, 10)
			const y = parseInt(year, 10)
			const currentYear = new Date().getFullYear() % 100
			const currentMonth = new Date().getMonth() + 1
			if (m < 1 || m > 12) {
				newErrors.expiry = "Invalid month"
				isValid = false
			} else if (y < currentYear || (y === currentYear && m < currentMonth)) {
				newErrors.expiry = "Card expired"
				isValid = false
			}
		}

		if (formData.cvv.length < 3) {
			newErrors.cvv = "Invalid CVV"
			isValid = false
		}

		setErrors(newErrors)
		return isValid
	}

	const handleDigitalWalletPay = async () => {
		setIsProcessing(true)
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000))
		router.push(
			`/status?result=success&amount=${amount}&recipient=${encodeURIComponent(recipient)}`
		)
	}

	const handlePay = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return

		setIsProcessing(true)

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000))

		router.push(
			`/status?result=success&amount=${amount}&recipient=${encodeURIComponent(recipient)}`
		)
	}

	const inputClass = (hasError: boolean) =>
		`w-full pl-12 pr-4 py-3 bg-gray-100 border rounded-xl focus:ring-2 focus:bg-white outline-none transition-all font-mono text-lg text-gray-900 placeholder:text-gray-400 ${
			hasError
				? "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
				: "border-gray-200 focus:ring-blue-500 hover:bg-gray-50"
		}`

	return (
		<div className='md:max-w-md w-full bg-white md:rounded-3xl rounded-none shadow-2xl overflow-hidden flex flex-col relative animate-fade-in-up h-[100dvh] md:h-auto'>
			<div className='bg-gray-900 p-8 text-white relative overflow-hidden shrink-0'>
				<div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl'></div>

				<div className='mb-6 relative z-10'>
					<p className='text-gray-400 text-xs font-bold uppercase tracking-wider mb-2'>
						Payment Receiver
					</p>
					<div className='flex items-center gap-3 bg-white/10 p-2 pr-4 rounded-xl w-fit backdrop-blur-sm border border-white/5'>
						<div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg'>
							{recipient.charAt(0).toUpperCase()}
						</div>
						<span className='text-xl font-bold tracking-tight'>{recipient}</span>
					</div>
				</div>

				<div className='relative z-10'>
					<p className='text-gray-400 text-xs font-bold uppercase tracking-wider mb-1'>
						Total Amount
					</p>
					<h1 className='text-5xl font-bold tracking-tighter'>
						€{parseFloat(amount).toFixed(2)}
					</h1>
				</div>
			</div>

			<form onSubmit={handlePay} className='p-8 flex flex-col gap-6'>
				<div className='flex flex-col gap-4'>
					<div className='grid grid-cols-2 gap-4'>
						<button
							type='button'
							onClick={handleDigitalWalletPay}
							disabled={isProcessing}
							className='flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all font-semibold text-[17px] tracking-tight hover:shadow-lg hover:shadow-black/10'
						>
							<svg className='w-5 h-5 mb-0.5' viewBox='0 0 384 512' fill='currentColor'>
								<path d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-105.5-70-105.5-119.3zm-101.4-124c2.5 28.3 22.8 61.3 54.2 61.3 5.4-32.9-18.9-63.5-54.2-61.3z' />
							</svg>
							Pay
						</button>
						<button
							type='button'
							onClick={handleDigitalWalletPay}
							disabled={isProcessing}
							className='flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-3.5 rounded-xl hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all font-semibold text-[17px] tracking-tight hover:shadow-lg hover:shadow-gray-200/50'
						>
							<svg className='w-5 h-5' viewBox='0 0 24 24'>
								<path
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									fill='#4285F4'
								/>
								<path
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									fill='#34A853'
								/>
								<path
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									fill='#FBBC05'
								/>
								<path
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									fill='#EA4335'
								/>
							</svg>
							Pay
						</button>
					</div>

					<div className='flex items-center gap-4'>
						<div className='h-px bg-gray-200 flex-1' />
						<span className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>
							Or pay with card
						</span>
						<div className='h-px bg-gray-200 flex-1' />
					</div>
				</div>

				<div className='space-y-4'>
					{/* Camera Input */}
					<input
						type='file'
						ref={fileInputRef}
						className='hidden'
						accept='image/*'
						capture='environment'
						onChange={handleScan}
					/>
					{/* Gallery Input */}
					<input
						type='file'
						ref={galleryInputRef}
						className='hidden'
						accept='image/*'
						onChange={handleScan}
					/>

					<button
						type='button'
						onClick={() => setShowScanModal(true)}
						className='w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100'
					>
						<Camera className='w-5 h-5' />
						Scan Card
					</button>

					{scanError && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-red-50 text-red-500 text-sm font-medium px-4 py-3 rounded-xl border border-red-100 flex items-center justify-center text-center'
						>
							{scanError}
						</motion.div>
					)}

					<AnimatePresence>
						{showScanModal && (
							<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md'>
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className='bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative'
								>
									<div className='relative h-64 bg-gray-900 flex items-center justify-center overflow-hidden'>
										<div className='absolute inset-0 opacity-20 bg-[url("https://grainy-gradients.vercel.app/noise.svg")]'></div>
										<motion.div
											animate={{ top: ["10%", "90%", "10%"] }}
											transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
											className='absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)] z-20'
										/>
										<div className='w-48 h-32 border-2 border-white/30 rounded-xl relative z-10'>
											<div className='absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white'></div>
											<div className='absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white'></div>
											<div className='absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white'></div>
											<div className='absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white'></div>
										</div>
										<p className='absolute bottom-4 text-white/50 text-sm font-medium'>
											Align card within frame
										</p>
									</div>

									<div className='p-6'>
										<h3 className='text-lg font-bold text-gray-900 text-center mb-4'>
											Scan Payment Card
										</h3>
										<div className='grid grid-cols-2 gap-3'>
											<button
												type="button"
												onClick={() => {
													setShowScanModal(false)
													fileInputRef.current?.click()
												}}
												className='flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 rounded-xl text-blue-600 font-semibold hover:bg-blue-100 transition-colors'
											>
												<Camera className='w-6 h-6' />
												<span>Camera</span>
											</button>
											<button
												type="button"
												onClick={() => {
													setShowScanModal(false)
													galleryInputRef.current?.click()
												}}
												className='flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors'
											>
												<ImageIcon className='w-6 h-6' />
												<span>Gallery</span>
											</button>
										</div>
										<button
											onClick={() => setShowScanModal(false)}
											className='w-full mt-4 py-3 text-gray-400 font-medium hover:text-gray-600'
										>
											Cancel
										</button>
									</div>
								</motion.div>
							</div>
						)}
					</AnimatePresence>

					<div className='space-y-2'>
						<div className='flex justify-between'>
							<label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
								Card Number
							</label>
							{errors.cardNumber && (
								<span className='text-xs text-red-500 font-medium'>
									{errors.cardNumber}
								</span>
							)}
						</div>
						<div className='relative'>
							<CreditCard
								className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
									errors.cardNumber ? "text-red-400" : "text-gray-400"
								}`}
							/>
							<input
								type='text'
								name='cardNumber'
								value={formData.cardNumber}
								placeholder='0000 0000 0000 0000'
								className={inputClass(!!errors.cardNumber)}
								required
								maxLength={19}
								onChange={handleInput}
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<div className='flex justify-between'>
								<label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
									Expiry Date
								</label>
								{errors.expiry && (
									<span className='text-xs text-red-500 font-medium'>
										{errors.expiry}
									</span>
								)}
							</div>
							<div className='relative'>
								<Calendar
									className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
										errors.expiry ? "text-red-400" : "text-gray-400"
									}`}
								/>
								<input
									type='text'
									name='expiry'
									value={formData.expiry}
									placeholder='MM/YY'
									className={inputClass(!!errors.expiry)}
									required
									maxLength={5}
									onChange={handleInput}
								/>
							</div>
						</div>
						<div className='space-y-2'>
							<div className='flex justify-between'>
								<label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
									CVV
								</label>
								{errors.cvv && (
									<span className='text-xs text-red-500 font-medium'>{errors.cvv}</span>
								)}
							</div>
							<div className='relative'>
								<Lock
									className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
										errors.cvv ? "text-red-400" : "text-gray-400"
									}`}
								/>
								<input
									type='password'
									name='cvv'
									value={formData.cvv}
									placeholder='123'
									className={inputClass(!!errors.cvv)}
									required
									maxLength={3}
									onChange={handleInput}
								/>
							</div>
						</div>
					</div>
				</div>

				<motion.button
					whileTap={{ scale: 0.98 }}
					type='submit'
					disabled={isProcessing}
					className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed'
				>
					{isProcessing ? (
						<div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
					) : (
						<>
							Confirm Payment <ArrowRight className='w-5 h-5' />
						</>
					)}
				</motion.button>

				<div className='flex justify-center items-center gap-1.5 text-xs text-gray-400 font-medium opacity-60'>
					<Lock className='w-3 h-3' />
					Payments are secure and encrypted
				</div>
			</form>
		</div>
	)
}

export default function PayPage() {
	return (
		<main className='min-h-screen bg-gray-100 flex items-center justify-center md:p-4 p-0'>
			<Suspense
				fallback={
					<div className='animate-pulse md:max-w-md w-full h-[100dvh] md:h-[500px] bg-gray-200 md:rounded-3xl' />
				}
			>
				<PayContent />
			</Suspense>
		</main>
	)
}
