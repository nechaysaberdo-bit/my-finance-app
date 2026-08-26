import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Money, Muted, palette } from '../components/ui';

const nav = [
  ['⌂','Home','/'], ['♡','Transactions','/transactions'], ['💳','Credit','/credit'], ['✿','Obligations','/obligations'], ['⚙','More','/more']
];
export default function Home(){
 const r=useRouter();
 return <View style={{flex:1,backgroundColor:palette.bg}}><ScrollView contentContainerStyle={s.body}>
   <Text style={s.kicker}>Wednesday, August 26</Text><Text style={s.h1}>Hi Becca ♡</Text>
   <Card style={s.hero}><Muted>Money available to enjoy</Muted><Money large>₱20,700</Money><Muted>after bills, card dues & savings are set aside</Muted></Card>
   <View style={s.grid}>
    <Tile bg={palette.mint} icon="🌷" label="Income" value="₱85,000" onPress={()=>r.push('/income')}/>
    <Tile bg={palette.butter} icon="🧺" label="Expenses" value="₱31,300" onPress={()=>r.push('/expenses')}/>
    <Tile bg={palette.lav} icon="💳" label="Card due" value="₱12,480" onPress={()=>r.push('/credit')}/>
    <Tile bg={palette.pink2} icon="💌" label="Bills + loans" value="₱24,500" onPress={()=>r.push('/obligations')}/>
   </View>
   <Card onPress={()=>r.push('/credit')}><Text style={s.cardTitle}>Next card statement</Text><Text style={{fontWeight:'700',marginTop:7,color:palette.ink}}>Metrobank Visa</Text><View style={s.between}><Muted>Current estimated statement</Muted><Money>₱12,480</Money></View></Card>
 </ScrollView><BottomNav router={r}/></View>
}
function Tile({bg,icon,label,value,onPress}){return <Pressable onPress={onPress} style={[s.tile,{backgroundColor:bg}]}><Text style={{fontSize:20}}>{icon}</Text><Muted>{label}</Muted><Text style={s.tileValue}>{value}</Text></Pressable>}
function BottomNav({router}){return <View style={s.nav}>{nav.map(([i,l,p])=><Pressable key={l} onPress={()=>router.replace(p)} style={s.navBtn}><Text style={{fontSize:19}}>{i}</Text><Text style={s.navText}>{l}</Text></Pressable>)}</View>}
const s=StyleSheet.create({body:{paddingTop:58,paddingHorizontal:18,paddingBottom:110},kicker:{fontSize:12,color:palette.muted,fontWeight:'700'},h1:{fontFamily:'Georgia',fontStyle:'italic',fontWeight:'700',fontSize:30,color:'#684f5a',marginBottom:16},hero:{backgroundColor:palette.pink,padding:20,borderRadius:28},grid:{display:'flex',flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:14},tile:{width:'48.5%',borderRadius:20,padding:14,minHeight:92},tileValue:{fontFamily:'Georgia',fontSize:18,fontWeight:'700',color:palette.ink,marginTop:3},cardTitle:{fontFamily:'Georgia',fontSize:19,fontWeight:'700',color:'#684f5a'},between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:7},nav:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:'#fffaf9',borderTopWidth:1,borderTopColor:palette.line,flexDirection:'row',paddingTop:8,paddingBottom:22},navBtn:{flex:1,alignItems:'center'},navText:{fontSize:9,color:'#956878',marginTop:2,fontWeight:'700'}})
