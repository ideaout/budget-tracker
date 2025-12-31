const {Op} = require('sequelize')
const { MonthlySummary, Transaction, Category, User } = require('../../../models');
const NotFound = require('../../errors/NotFoundError');
const BadRequestError = require('../../errors/BadRequestError')
const config = require('../../config/config')

class MonthlySummaryService {
    async getAll(){
        return await MonthlySummary.findAll();
    }

    async getById(id){
        const summary = await MonthlySummary.findByPk(id);
        if(!summary) throw new NotFound('Summary bulanan tidak ditemukan');
        return summary
    }

    async create(data){
        return await MonthlySummary.create(data);
    }

    async update(id, data){
        const summary = await MonthlySummary.findByPk(id);
        if(!summary) throw new NotFound('Summary bulanan tidak terupdate');
        await summary.update(data);
        return summary
    }

    async delete(id){
        const summary = await MonthlySummary.findByPk(id);
        if(!summary) throw new NotFound('Summary bulanan tidak terhapus');
        await summary.destroy();
        return true;
    }

    async generate(userId) {
        const now = new Date()
        const month = now.toLocaleDateString("id-ID", {month: "long"})
        const year = now.getFullYear()

        const startOfMonth = new Date(year, now.getMonth(), 1)
        const endOfMonth = new Date(year, now.getMonth() + 1, 0)

        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        
        const existing = await MonthlySummary.findOne({
            where: {
                user_id: userId,
                created_at: { [Op.gte]: startOfDay, [Op.lte]: endOfDay }
            },
        })

        if(existing){
            throw new BadRequestError("Summary Hari ini sudah di generate, coba lagi besok")
        }

        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
                date: { [Op.between]: [startOfMonth, endOfMonth] }
            },
            include: ['category']
        })

        const user = await User.findByPk(userId)
        if(!user) throw new NotFound("Pengguna tidak ditemukan!")

        let totalIncome = 0
        let totalExpense = 0

        const formattedTx = transactions.map((tx) => {
            const amount = parseInt(tx.amount)
            if(tx.type === "income") totalIncome += amount
            if(tx.type === "expense") totalExpense += amount

            return {
                type: tx.type === "income" ? "pemasukan" : "pengeluaran",
                category: tx.category?.name || "Lainnya",
                amount,
                date: tx.date.toISOString().split("T")[0]
            }

        })

        const payload = {
            user: user.name,
            month: `${month} ${year}`,
            transactions: formattedTx,
            total_income: totalIncome,
            total_expense: totalExpense
        }

//        const body = {
//            model: "microsoft/phi-3-mini-128k-instruct:free",
//           messages: [
//                 {
//                     role: "system",
//                     content: `You are a financial expert. Create a financial summary from the following JSON data.
//                                 You MUST respond ONLY with valid JSON in this EXACT structure:
//                             {
//                                 "summary": "string in Indonesian",
//                                 "recommendations": ["string in Indonesian", "string in Indonesian"],
//                                 "trend_analysis": "string in Indonesian"
//                             }

//                             Rules:
//                                 - Use Indonesian language only
//                                 - Return ONLY the JSON object
//                                 - No markdown, no explanations, no extra text
//                                 - No \`\`\`json formatting
//                             `,
//                 },
//                 {
//                     role: "user",
//                     content: JSON.stringify(payload)
//                 }
//             ]
//         }


        const body = {
            model: "google/gemma-2-9b-it:free",
            messages: [
                {
                    role: "system",
                    content: `Respond in Indonesian only. You are a financial expert. Return ONLY valid JSON.`
                },
                {
                    role: "user", 
                    content: `Create financial summary for: ${JSON.stringify(payload)}. Return ONLY this JSON structure: {"summary":"string","recommendations":["string"],"trend_analysis":"string"}`
                }
            ],
            temperature: 0.1 // Make it more consistent
        }

        const delay = (ms) => new Promise((res) => setTimeout(res, ms))
        let retries = 3
        let response

        while(retries > 0){
            response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.llm.openRouter}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body),
            })

            if(response.status !== 429) break
            await delay(3000)
            retries--
        }
        console.log("🔍 Response status:", response.status);
        console.log("🔍 Response headers:", response.headers);
        if(!response.ok) {
            const errorText = await response.text(); // Read once
            console.log("🔍 Error response:", errorText);
            throw new BadRequestError("Terjadi Kesalahan, harap di coba lagi")
        }

        const result = await response.json()

        const content = result.choices?.[0]?.message?.content || ""

        let parsed
        try {
            let cleaned = content.replace(/```json\s*|\s*```/g, "").trim()
            cleaned = cleaned.replace(/```/g, "").trim()
            console.log("🧹 Cleaned JSON:", cleaned); // Debug
            parsed = JSON.parse(cleaned)

            if(!parsed.summary || !parsed.recommendations || !parsed.trend_analysis) {
                throw new BadRequestError("Struktur JSON tidak lengkap")
            }
        } catch (error) {
            console.error("❌ JSON Parse Error:", error);
            console.error("❌ Content that failed:", content);
            throw new BadRequestError("Gagal mengurai response JSON dari LLM, harap dicoba lagi!")
        }
        
        const summary = await MonthlySummary.create({
            user_id: userId,
            month,
            year: String(year),
            total_income: String(totalIncome),
            total_expense: String(totalExpense),
            balance: String(totalIncome-totalExpense),
            ai_summary: parsed.summary,
            ai_recommendation: JSON.stringify({ // ← Save as JSON string
        recommendations: parsed.recommendations,
        trend_analysis: parsed.trend_analysis
    })
        })
    
        return {
            summary: parsed.summary,
            recommendations: parsed.recommendations,
            trend_analysis: parsed.trend_analysis
        }
    }

    
}

module.exports = new MonthlySummaryService();