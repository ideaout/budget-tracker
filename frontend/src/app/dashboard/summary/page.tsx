"use client"

import React, { useState, useEffect } from "react"
import { FaRobot, FaSync } from "react-icons/fa"
import {
    generateMonthlySummary,
    fetchAllMonthlySummaries
} from "@/services/monthlySummary"
import {profile as fetchProfile } from "@/services/auth"
import Modal from "@/ui/Modal"
import { ModalProps } from "@/interfaces/IModal"
import { SummaryItem } from "@/interfaces/ISummary"
import { LLMResponse } from "@/interfaces/ILLM"

export default function SummaryPage() {
    const [loading, setLoading] = useState<boolean>(false)
    const [response, setResponse] = useState<LLMResponse | null>(null)
    const [alreadyGenerated, setAlreadyGenerated] = useState<boolean>(false)
    const [errorModal, setErrorModal] = useState<ModalProps | null>(null)

    const checkTodaySummaries = async () => {
        try {
            const token = localStorage.getItem("token")
            const profileRes = await fetchProfile(token || "")
            const userId = profileRes.data.id

            const res = await fetchAllMonthlySummaries()
            const today = new Date().toISOString().slice(0, 10)

            const found = res.data.find(
                (item: SummaryItem) =>
                    item.user_id === userId &&
                item.created_at?.slice(0, 10) === today
            )

            if (found){
    console.log("🔍 Full found object:", found);
    console.log("🔍 ai_recommendation value:", found.ai_recommendation);
    console.log("🔍 ai_recommendation type:", typeof found.ai_recommendation);
    
    setAlreadyGenerated(true)
    
    let recommendations: string[] = [];
    let trendAnalysis = "No trend analysis available";
    
    if (found.ai_recommendation) {
        try {
            console.log("🔍 Trying to parse:", found.ai_recommendation);
            const parsed = JSON.parse(found.ai_recommendation);
            console.log("✅ Parsed successfully:", parsed);
            recommendations = parsed.recommendations || [];
            trendAnalysis = parsed.trend_analysis || "";
        } catch (error) {
            console.error("❌ JSON parse failed:", error);
            // Fallback for old format
            const lines = found.ai_recommendation.split("\n");
            recommendations = lines.slice(0, -1);
            trendAnalysis = lines.slice(-1)[0] || "";
        }
    } else {
        console.log("❌ ai_recommendation is null/undefined");
    }
    
    console.log("🎯 Final recommendations:", recommendations);
    console.log("🎯 Final trend_analysis:", trendAnalysis);
    
    setResponse({
        summary: found.ai_summary || "No summary available",
        recommendation: recommendations,
        trend_analysis: trendAnalysis
    })
}
        } catch (error) {
            if(error instanceof Error){
                setErrorModal({message: error.message, type: "danger"})
            } else {
                setErrorModal({message: "Terjadi Kesalahan", type: "danger"})

            }
        }
    }

    useEffect(() => {
        checkTodaySummaries()
    }, [])

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const result = await generateMonthlySummary()

            if(result.success && result.data){
                setResponse({
                    summary: result.data.summary,
                    recommendation: result.data.recommendations,
                    trend_analysis: result.data.trend_analysis
                })
                setAlreadyGenerated(true)
            } else {
                throw new Error(result.message || "Gagal menghasilkan Ringkasan")
            }
        } catch (error) {
            if(error instanceof Error){
                setErrorModal({message: error.message, type: "danger"})
            } else {
                setErrorModal({message: "Terjadi Kesalahan", type: "danger"})

            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">AI Financial Summary</h2>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                    <span className="inline-block ">
                        {loading ? <FaSync className="animate-spin" /> : <FaRobot />}
                    </span>
                    {loading ? "Menganalasis ..." : "Generate Summary"}
                </button>
            </div>
            {response && (
            <div className="space-y-4 ">
                <div className="bg-white rounded-xl p-4 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-indigo-600">Ringkasan</h3>
                    <p className="text-gray-700">{response.summary}</p>
                </div>

                {Array.isArray(response.recommendation) && (
                <div className="bg-white rounded-xl p-4 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-green-600">Rekomendasi</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ">
                        {response.recommendation.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                        ))}
                    </ul>
                </div>
                )}

                <div className="bg-white rounded-xl p-4 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-600">Analisis Tren</h3>
                    <p className="text-gray-700">{response.trend_analysis}</p>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                    Kamu bisa meminta ringkasan baru di esok hari
                </p>
                <p className="text-xs text-gray-400">Powered by AI - Google/Gemma</p>
            </div>
            )}

            {!response && !loading && !alreadyGenerated && (
                <div className="text-gray-500 text-sm">
                    Klik Tombol <b>&quot;Generate Summary&quot;</b> untuk mendapatkan analsis otomatis
                </div>
            )}

            {errorModal && (
                <Modal 
                    type="danger"
                    message={errorModal.message}
                    onOk={() => setErrorModal(null)}
                />
            )}
        </div>
    )
}