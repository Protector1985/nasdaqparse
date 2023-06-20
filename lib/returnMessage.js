//returns the message by reason code

function returnMessage(code) {
    const codes = {
        "T1": "Halt - News Pending",
        "T2": "Halt - News Released",
        "T5": "Single Stock Trading Pause in Effect",
        "T6": "Halt - Extraordinary Market Activity",
        "T8": "Halt - Exchange-Traded-Fund (ETF)",
        "T12": "Halt - Additional Information Requested by NASDAQ",
        "H4": "Halt - Non-compliance",
        "H9": "Halt - Not Current",
        "H10": "Halt - SEC Trading Suspension",
        "H11": "Halt - Regulatory Concern",
        "O1": "Operations Halt, Contact Market Operations",
        "IPO1": "IPO Issue not yet Trading",
        "M1": "Corporate Action",
        "M2": "Quotation Not Available",
        "LUDP": "Volatility Trading Pause",
        "LUDS": "Volatility Trading Pause - Straddle Condition",
        "MWC1": "Market Wide Circuit Breaker Halt - Level 1",
        "MWC2": "Market Wide Circuit Breaker Halt - Level 2",
        "MWC3": "Market Wide Circuit Breaker Halt - Level 3",
        "MWC0": "Market Wide Circuit Breaker Halt - Carry over from previous day",
        "T3": "News and Resumption Times",
        "T7": "Single Stock Trading Pause/Quotation-Only Period",
        "R4": "Qualifications Issues Reviewed/Resolved; Quotations/Trading to Resume",
        "R9": "Filing Requirements Satisfied/Resolved; Quotations/Trading To Resume",
        "C3": "Issuer News Not Forthcoming; Quotations/Trading To Resume",
        "C4": "Qualifications Halt ended; maint. req. met; Resume",
        "C9": "Qualifications Halt Concluded; Filings Met; Quotes/Trades To Resume",
        "C11": "Trade Halt Concluded By Other Regulatory Auth,; Quotes/Trades Resume",
        "R1": "New Issue Available",
        "R2": "Issue Available",
        "IPOQ": "IPO security released for quotation",
        "IPOE": "IPO security - positioning window extension",
        "MWCQ": "Market Wide Circuit Breaker Resumption",
        "M": "Volatility Trading Pause",
        "D": "Security deletion from NASDAQ / CQS",
    };

    return codes[code] || "Code not found";
}

module.exports = returnMessage;
