


type User = {
    id: string,
    collectionId: string,
    collectionName: string,
    created: string,
    updated: string,
    username: string,
    verified: boolean,
    emailVisibility: boolean
    email: string,
    name: string,
    avatar: string,
}

type UserImportantData = {
    id: string,
    payment_level: "free" | "premium",
    stripe_subscription_id: string,
    related_user: string,
    free_optimizations: number,
    stripe_customer_id: string,
}


type UserDetails = {
    id: string,
    bio: string,
    nickname: string,
    related_user: string,
    last_optimization: string,
}

type Etf = {
    ticker: string;
    exchange: string;
    isin: string;
    country: string;
    name: string;
    data_from: string;
    data_to: string;
}


type PythonResponseETF = {
    ticker: string,
    exchange: string,
    isin: string,
    percent: number,
    last_price: number,
}

type PythonResponseLayer = {
    etfs: PythonResponseETF[],
    risk: number,
    expected_return: number,
    sharpe_ratio: number,
}

type UserActivity = {
    id: string,
    created: string,
    updated: string,
    related_user: string,
    activity_type: string,
    stripe_ref: string,
    note: string,
    activity_input: string,
    activity_output: string,
}


export enum OptimizationPhase {
    ETF_SELECTION,
    ETF_OPTIMIZATION
}


export type {
    User,
    UserImportantData,
    UserDetails,
    Etf,
    PythonResponseETF,
    PythonResponseLayer,
    UserActivity,
}