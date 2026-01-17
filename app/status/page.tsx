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
					<div className='bg-gray-50 rounded-2xl p-6 w-full mb-8 border border-gray-100'>
						<div className='flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm'>
							<div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold'>
								{(recipient || "Merchant").charAt(0).toUpperCase()}
							</div>
							<div className='text-left'>
								<p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>
									Paid to
								</p>
								<p className='text-gray-900 font-bold'>{recipient || "Merchant"}</p>
							</div>
						</div>

						<p className='text-gray-400 text-xs font-bold uppercase tracking-wider mb-1'>
							Amount Paid
						</p>
						<p className='text-4xl font-bold text-gray-900 tracking-tight'>${amount}</p>
						<div className='w-full h-px bg-gray-200 my-4' />
						<div className='flex justify-between text-sm'>
							<span className='text-gray-500'>Ref Number</span>
							<span className='font-mono text-gray-800'>{txnRef}</span>
						</div>
						<div className='flex justify-between text-sm mt-2'>
							<span className='text-gray-500'>Date</span>
							<span className='text-gray-800'>{new Date().toLocaleDateString()}</span>
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
