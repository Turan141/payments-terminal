"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { ScanLine, ChevronRight, Euro, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"

export default function MerchantPage() {
	const [cents, setCents] = useState(0)
	const [qrValue, setQrValue] = useState<string | null>(null)
	const [origin, setOrigin] = useState("")
	const [isCheckingAuth, setIsCheckingAuth] = useState(true)
	const [txnStatus, setTxnStatus] = useState<"idle" | "processing" | "success">("idle")
	const [statusMessage, setStatusMessage] = useState("")
	const recipient = "Vibo Place"
	const router = useRouter()

	const amount = (cents / 100).toFixed(2)

	useEffect(() => {
		const setupAuth = () => setIsCheckingAuth(false)
		const isAuthenticated = localStorage.getItem("isAuthenticated")

		if (!isAuthenticated) {
			router.push("/login")
		} else {
			setupAuth()
		}
	}, [router])

	useEffect(() => {
		if (isCheckingAuth) return
		const handleSetOrigin = (url: string) => setOrigin(url)
		handleSetOrigin(window.location.origin)
	}, [isCheckingAuth])

	if (isCheckingAuth) {
		return null // Or a loading spinner
	}

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault()
		if (cents <= 0) return

		const authToken = localStorage.getItem("authToken")
		if (!authToken) {
			router.push("/login")
			return
		}

		try {
			const data = await api.post<{ data: { paymentId: number } }>(
				"/payment/init",
				{},
				{
					params: { amount, currency: "EUR" },
					token: authToken
				}
			)

			if (data?.data?.paymentId) {
				const payUrl = `${origin}/pay?paymentId=${data.data.paymentId}`
				setQrValue(payUrl)
				setTxnStatus("idle")
			}
		} catch (error) {
			console.error("Payment init error", error)
			alert("Failed to create payment")
		}
	}

	const handleNewPayment = () => {
		setCents(0)
		setQrValue(null)
		setTxnStatus("idle")
	}

	const simulateTransaction = async () => {
		if (qrValue) {
			window.open(qrValue, "_blank")
		}

		setTxnStatus("processing")
		setStatusMessage("Device connected...")
		await new Promise((r) => setTimeout(r, 1000))
		setStatusMessage("Processing payment...")
		await new Promise((r) => setTimeout(r, 1500))
		setStatusMessage("Verifying funds...")
		await new Promise((r) => setTimeout(r, 1000))
		setTxnStatus("success")
		setStatusMessage("Approved!")
	}

	return (
		<main className='min-h-screen bg-gray-50 flex flex-col items-center justify-center md:p-4 p-0 font-sans text-gray-900'>
			<div className='md:max-w-md w-full bg-white md:rounded-3xl rounded-none shadow-xl overflow-hidden min-h-[100dvh] md:h-auto md:min-h-[600px] flex flex-col relative'>
				<div className='bg-blue-600 p-6 text-white text-center shadow-lg z-10'>
					<h1 className='text-xl font-bold flex items-center justify-center gap-2 tracking-tight'>
						<ScanLine className='w-6 h-6' />
						POS Terminal
					</h1>
					<p className='text-blue-100 text-xs uppercase tracking-wider font-semibold mt-1'>
						Merchant Dashboard
					</p>
				</div>

				<div className='flex-1 p-8 flex flex-col items-center justify-center'>
					<AnimatePresence mode='wait'>
						{!qrValue ? (
							<motion.form
								key='input'
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.3 }}
								onSubmit={handleGenerate}
								className='w-full flex flex-col gap-8'
							>
								<div className='text-center'>
									<div className='flex items-center justify-center gap-2 mb-8 bg-blue-50 py-3 rounded-xl border border-blue-100'>
										<div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md'>
											V
										</div>
										<span className='font-bold text-lg text-gray-800 tracking-tight'>
											Vibo Place
										</span>
									</div>

									<label
										htmlFor='amount'
										className='block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4'
									>
										Enter Amount
									</label>
									<div className='relative group'>
										<Euro className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-8 h-8 group-focus-within:text-blue-500 transition-colors' />
										<input
											id='amount'
											type='text'
											inputMode='numeric'
											value={amount}
											onKeyDown={(e) => {
												if (
													!/^[0-9]$/.test(e.key) &&
													e.key !== "Backspace" &&
													e.key !== "Tab" &&
													e.key !== "Enter" &&
													!e.metaKey &&
													!e.ctrlKey
												) {
													e.preventDefault()
												}

												if (/^[0-9]$/.test(e.key)) {
													e.preventDefault()
													setCents((prev) => prev * 10 + parseInt(e.key))
												} else if (e.key === "Backspace") {
													e.preventDefault()
													setCents((prev) => Math.floor(prev / 10))
												}
											}}
											onChange={() => {}} // Controlled by onKeyDown
											placeholder='0.00'
											className='w-full pl-14 pr-4 py-5 text-5xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 text-center caret-transparent cursor-pointer selection:bg-transparent'
											autoFocus
										/>
									</div>
								</div>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type='submit'
									disabled={cents <= 0}
									className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 mt-4'
								>
									Generate QR
									<ChevronRight className='w-5 h-5' />
								</motion.button>
							</motion.form>
						) : (
							<motion.div
								key='qr'
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ type: "spring", bounce: 0.5 }}
								className='flex flex-col items-center gap-6 w-full'
							>
								<div className='text-center mb-6'>
									<div className='flex flex-col items-center justify-center gap-3 mb-2'>
										<div className='w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/20 ring-4 ring-white'>
											{recipient.charAt(0).toUpperCase()}
										</div>
										<span className='font-bold text-2xl text-gray-900 tracking-tight'>
											{recipient}
										</span>
									</div>
									<p className='text-sm text-gray-500 font-medium bg-gray-100 py-1 px-3 rounded-full inline-block'>
										Verified Merchant
									</p>
								</div>

								<div className='text-center space-y-1'>
									<p className='text-gray-400 text-xs font-bold uppercase tracking-wider'>
										Payment Amount
									</p>
									<p className='text-5xl font-bold text-gray-900 tracking-tighter'>
										€{amount}
									</p>
								</div>

								<div
									className={`transition-all duration-300 relative group min-h-[300px] flex items-center justify-center ${
										txnStatus === "idle"
											? "w-fit bg-white p-6 rounded-3xl border border-gray-100 cursor-pointer hover:scale-105"
											: "w-full"
									}`}
									onClick={txnStatus === "idle" ? simulateTransaction : undefined}
									title='Click to simulate scan'
								>
									<AnimatePresence mode='wait'>
										{txnStatus === "idle" && (
											<motion.div
												key='qr'
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className='flex flex-col items-center justify-center w-full relative'
											>
												<div className='absolute inset-0 -m-6 rounded-3xl border-2 border-dashed border-blue-200 group-hover:border-blue-500 transition-colors pointer-events-none' />
												<QRCodeSVG
													value={qrValue || ""}
													size={220}
													level='H'
													className='relative z-10'
												/>
												<div className='absolute -bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-20'>
													Scan to Pay
												</div>
											</motion.div>
										)}

										{txnStatus === "processing" && (
											<motion.div
												key='processing'
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												className='flex flex-col items-center gap-4 py-8'
											>
												<div className='relative'>
													<div className='absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75' />
													<div className='relative bg-white p-4 rounded-full shadow-sm border border-blue-100'>
														<Loader2 className='w-12 h-12 text-blue-600 animate-spin' />
													</div>
												</div>
												<div className='text-center space-y-1'>
													<p className='font-bold text-lg text-gray-800'>Processing</p>
													<p className='text-sm text-gray-500 animate-pulse'>
														{statusMessage}
													</p>
												</div>
											</motion.div>
										)}

										{txnStatus === "success" && (
											<motion.div
												key='success'
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												className='flex flex-col items-center gap-4 py-8 w-full'
											>
												<div className='bg-green-100 p-6 rounded-full'>
													<CheckCircle2 className='w-16 h-16 text-green-600' />
												</div>
												<div className='text-center space-y-2'>
													<p className='font-bold text-2xl text-gray-800'>
														{statusMessage}
													</p>
													<p className='text-gray-500'>Payment received successfully</p>
												</div>
												<motion.button
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: 0.2 }}
													onClick={handleNewPayment}
													className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2'
												>
													New Payment
												</motion.button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								{txnStatus === "idle" && (
									<p className='text-gray-400 text-sm text-center font-medium max-w-[200px] leading-relaxed'>
										Scan to pay securely via credit card
									</p>
								)}

								{txnStatus !== "success" && (
									<button
										onClick={handleNewPayment}
										className='mt-6 text-sm text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-full transition-colors'
									>
										Cancel / New Payment
									</button>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</main>
	)
}
