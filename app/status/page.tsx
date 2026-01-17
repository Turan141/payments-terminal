"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Share2, Download } from "lucide-react"
import { motion } from "framer-motion"

function StatusContent() {
	const searchParams = useSearchParams()
	const result = searchParams.get("result")
	const amount = searchParams.get("amount")
	const recipient = searchParams.get("recipient")
	const isSuccess = result === "success"
	const [txnRef, setTxnRef] = useState("")

	useEffect(() => {
		// eslint-disable-next-line
		setTxnRef(`TXN-${Math.floor(Math.random() * 1000000)}`)
	}, [])

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Payment Receipt",
					text: `Payment of $${amount} to ${
						recipient || "Merchant"
					} was ${isSuccess ? "successful" : "failed"}.`,
					url: window.location.href
				})
			} catch (err) {
				console.error("Share failed", err)
			}
		} else {
			alert("Share not supported on this device")
		}
	}

	const handleDownload = () => {
		alert("Simulating receipt download...")
	}

	return (
		<motion.div
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className='md:max-w-md w-full bg-white md:rounded-3xl rounded-none shadow-2xl overflow-hidden p-8 flex flex-col items-center justify-center text-center relative h-[100dvh] md:h-auto'
		>
			<div
				className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${
					isSuccess ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"
				}`}
			>
				{isSuccess ? (
					<CheckCircle className='w-12 h-12' />
				) : (
					<XCircle className='w-12 h-12' />
				)}
			</div>

			<h1 className='text-2xl font-bold text-gray-900 mb-2'>
				{isSuccess ? "Payment Successful!" : "Payment Failed"}
			</h1>

			{isSuccess && (
				<>
					<p className='text-gray-500 mb-8'>Your transaction has been processed.</p>
					<div className='relative bg-gray-50 rounded-2xl p-6 w-full mb-8 border border-gray-100 overflow-hidden'>
						{/* Jagged edge bottom effect (simulated with CSS background or just a border style) */}
						<div
							className='absolute bottom-0 left-0 right-0 h-4 bg-white'
							style={{
								maskImage:
									"linear-gradient(45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%)",
								maskSize: "20px 40px",
								WebkitMaskImage:
									"linear-gradient(45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%)",
								WebkitMaskSize: "20px 20px",
								transform: "rotate(180deg)"
							}}
						/>

						<div className='flex items-center gap-4 mb-6 pb-6 border-b border-dashed border-gray-300'>
							<div className='w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30'>
								{(recipient || "Merchant").charAt(0).toUpperCase()}
							</div>
							<div className='text-left flex-1'>
								<p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>
									Paid to
								</p>
								<p className='text-lg font-bold text-gray-900 leading-tight'>
									{recipient || "Merchant"}
								</p>
							</div>
						</div>

						<div className='space-y-1 mb-6'>
							<p className='text-gray-400 text-xs font-bold uppercase tracking-wider'>
								Total Amount
							</p>
							<p className='text-5xl font-bold text-gray-900 tracking-tighter'>
								${amount}
							</p>
						</div>

						<div className='space-y-3 pt-2 text-sm'>
							<div className='flex justify-between items-center'>
								<span className='text-gray-500 font-medium'>Ref Number</span>
								<span className='font-mono text-gray-700 bg-gray-200/50 px-2 py-1 rounded'>
									{txnRef}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-gray-500 font-medium'>Details</span>
								<span className='text-gray-800 font-medium'>Visa •••• 4242</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-gray-500 font-medium'>Date</span>
								<span className='text-gray-800 font-medium'>
									{new Date().toLocaleString()}
								</span>
							</div>
						</div>
					</div>
				</>
			)}

			<div className='grid grid-cols-2 gap-4 w-full'>
				<button
					onClick={handleShare}
					className='flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 font-semibold text-gray-700 rounded-xl hover:bg-gray-200 transition-colors'
				>
					<Share2 className='w-5 h-5' /> Share
				</button>
				<button
					onClick={handleDownload}
					className='flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 font-semibold text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20'
				>
					<Download className='w-5 h-5' /> Receipt
				</button>
			</div>

			<Link
				href='/'
				className='mt-8 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors'
			>
				Return to Merchant
			</Link>
		</motion.div>
	)
}

export default function StatusPage() {
	return (
		<main className='min-h-screen bg-gray-100 flex items-center justify-center md:p-4 p-0'>
			<Suspense
				fallback={
					<div className='animate-pulse md:max-w-md w-full h-[100dvh] md:h-[400px] bg-white md:rounded-3xl' />
				}
			>
				<StatusContent />
			</Suspense>
		</main>
	)
}
