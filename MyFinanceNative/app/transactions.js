import { useRouter } from 'expo-router';
import { Screen, Card, ListItem } from '../components/ui';
export default function Transactions(){const r=useRouter();return <Screen title="Transactions ✿"><Card><ListItem icon="🛒" title="Groceries" subtitle="Food · cash" right="−₱1,850"/><ListItem icon="💳" title="SM Appliance" subtitle="Metrobank · installment" right="−₱30,000" onPress={()=>r.push('/card')}/><ListItem icon="🌷" title="Salary" subtitle="Primary income" right="+₱25,000" onPress={()=>r.push('/income')}/></Card></Screen>}
