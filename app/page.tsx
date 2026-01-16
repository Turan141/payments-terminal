"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { ScanLine, ChevronRight, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MerchantPage() {
	const [amount, setAmount] = useState("")
	const [qrValue, setQrValue] = useState<string | null>(null)
	const [origin, setOrigin] = useState("")

	useEffect(() => {
		const handleSetOrigin = (url: string) => setOrigin(url)
		handleSetOrigin(window.location.origin)
	}, [])

	const handleGenerate = (e: React.FormEvent) => {
		e.preventDefault()
		if (!amount || parseFloat(amount) <= 0) return

		const payUrl = `${origin}/pay?amount=${amount}`
		setQrValue(payUrl)
	}

	const handleNewPayment = () => {
		setAmount("")
		setQrValue(null)
	}

	return (
		<main className='min-h-screen bg-gray-50 flex flex-col items-center justify-center md:p-4 p-0 font-sans text-gray-900'>
			<div className='md:max-w-md w-full bg-white md:rounded-3xl rounded-none shadow-xl overflow-hidden h-[100dvh] md:h-auto md:min-h-[600px] flex flex-col relative'>
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
									<label
										htmlFor='amount'
										className='block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4'
									>
										Enter Amount
									</label>
									<div className='relative group'>
										<DollarSign className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-8 h-8 group-focus-within:text-blue-500 transition-colors' />
										<input
											id='amount'
											type='number'
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
											placeholder='0.00'
											step='0.01'
											className='w-full pl-14 pr-4 py-5 text-5xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 text-center'
											autoFocus
										/>
									</div>
								</div>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type='submit'
									disabled={!amount}
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
								<div className='text-center space-y-1'>
									<p className='text-gray-400 text-xs font-bold uppercase tracking-wider'>
										Payment Amount
									</p>
									<p className='text-5xl font-bold text-gray-900 tracking-tighter'>
										${parseFloat(amount).toFixed(2)}
									</p>
								</div>

								<div
									className='bg-white p-6 rounded-3xl shadow-inner border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-300'
									onClick={() => window.open(qrValue, "_blank")}
									title='Click to simulate scan'
								>
									<QRCodeSVG
										value={qrValue}
										size={220}
										level='H'
										className='w-full h-auto'
									/>
								</div>

								<p className='text-gray-400 text-sm text-center font-medium max-w-[200px] leading-relaxed'>
									Scan to pay securely via credit card
								</p>

								<button
									onClick={handleNewPayment}
									className='mt-6 text-sm text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-full transition-colors'
								>
									Cancel / New Payment
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</main>
	)
}
