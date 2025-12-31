"use client"


import TransactionForm from "@/pages/TransactionForm";
import { fetchTransactionById, editTransaction } from "@/services/transaction" ;
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/ui/Modal";
import LoadingSpinnerScreen from "@/ui/LoadingSpinnerScreen";
import { ModalProps } from "@/interfaces/IModal";
import { TransactionFormData } from "@/interfaces/ITransaction";


export default function EditTransactionPage(){
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    
    const [initialData, setInitialData] = useState<TransactionFormData>()
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [modal, setModal] = useState<ModalProps | null>(null)

    const loadTransaction = async () => {
        try {
            const res = await fetchTransactionById(Number(id))
            const tx = res.data

            setInitialData({
                type: tx.type,
                amount: tx.amount.toString(),
                date: tx.date.slice(0, 10),
                note: tx.note,
                categoryId: tx.category_id
            })
        } catch (error) {
            if(error instanceof Error) {
                setModal({ message: error.message, type: "danger"})
            } else {
                setModal({ message: "Terjadi Kesalahan", type: "danger"})
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTransaction()
    }, [id])

    const handleSubmit = async (form: TransactionFormData) => {
        setIsSubmitting(true)
        try {
            await editTransaction(Number(id), {
                ...form,
            })

            setModal({
                type: "success",
                message: "Transaksi Berhasil diperbarui"
            })
        } catch (error) {
            if(error instanceof Error) {
                setModal({ message: error.message, type: "danger"})
            } else {
                setModal({ message: "Terjadi Kesalahan", type: "danger"})
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <LoadingSpinnerScreen />

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Transaksi</h1>
            {isSubmitting && <LoadingSpinnerScreen />}
            {modal && (
                <Modal 
                type={modal.type}
                message={modal.message}
                onOk={() => {
                    setModal(null)
                    if(modal.type === "success"){
                        router.push("/dashboard/transaction")
                    }
                }}
                />
            )}
            {initialData && (
                <TransactionForm initialData={initialData} onSubmit={handleSubmit} />
            )}
        </div>
    )
}