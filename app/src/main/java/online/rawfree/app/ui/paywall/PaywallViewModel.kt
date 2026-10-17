package online.rawfree.app.ui.paywall

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel

data class PlanItem(
    val id: String,
    val title: String,
    val priceCents: Int,
    val periodDays: Int,
    val savingsPercent: Int,
    val savingsLabel: String?,
)

@HiltViewModel
class PaywallViewModel @Inject constructor() : ViewModel() {

    val plans = listOf(
        PlanItem(
            id = "premium_7",
            title = "7 дней",
            priceCents = 39900,
            periodDays = 7,
            savingsPercent = 0,
            savingsLabel = null,
        ),
        PlanItem(
            id = "premium_30",
            title = "30 дней",
            priceCents = 136800,
            periodDays = 30,
            savingsPercent = 20,
            savingsLabel = "Выгода 20%",
        ),
        PlanItem(
            id = "premium_365",
            title = "1 год",
            priceCents = 1664400,
            periodDays = 365,
            savingsPercent = 20,
            savingsLabel = "Выгода 20%",
        ),
    )

    fun purchasePlan(planId: String) {
        // TODO: вызвать RuStore Billing
    }
}
