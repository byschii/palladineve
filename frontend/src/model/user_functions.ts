import PocketBase from 'pocketbase';
import { UserDetails, UserImportantData } from './model';
import { useAppContext } from '../AppContext';

const state = useAppContext();

const pb = new PocketBase(state?.host);

async function getCurrentUserDetails(): Promise<UserDetails> {
    let userDetailsRequest = pb.collection("user_details").getList<UserDetails>(1, 1);
    let userDetails = (await userDetailsRequest).items[0];
    return userDetails;
}
async function getCurrentUserImportantData(): Promise<UserImportantData> {
    let userImportantDataRequest = pb.collection("user_important_data").getList<UserImportantData>(1, 1);
    let userImportantData = (await userImportantDataRequest).items[0];
    return userImportantData;
}

const currentUserImportantDataFetcher = async (
    current: UserImportantData,
    other: {
        lastReturnedValue: UserImportantData,
        refetch: boolean,
    }
) => {
    return await getCurrentUserImportantData();
}

export {
    getCurrentUserDetails,
    getCurrentUserImportantData,
    currentUserImportantDataFetcher,
}
