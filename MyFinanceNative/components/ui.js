import { View, Text, StyleSheet, Pressable } from 'react-native';

export const palette = {
  bg:'#fff9f8', ink:'#5b4650', muted:'#9a838c', pink:'#f7dce3', pink2:'#fbecef',
  lav:'#ebe3f7', mint:'#e2f2e9', butter:'#f8efcf', line:'#f1e4e7', accent:'#d6a7b5', white:'#fff'
};

export function Screen({ children, title, kicker, back, onBack }) {
  return <View style={s.screen}>
    {back && <Pressable onPress={onBack}><Text style={s.back}>‹ Back</Text></Pressable>}
    {kicker ? <Text style={s.kicker}>{kicker}</Text> : null}
    {title ? <Text style={s.h1}>{title}</Text> : null}
    {children}
  </View>
}
export function Card({ children, style, onPress }) {
  const C = onPress ? Pressable : View;
  return <C onPress={onPress} style={[s.card, style]}>{children}</C>
}
export function Row({ left, right, style }) { return <View style={[s.row, style]}><View style={{flex:1}}>{left}</View><View>{right}</View></View> }
export function Money({ children, large }) { return <Text style={large ? s.moneyLarge : s.money}>{children}</Text> }
export function Muted({ children }) { return <Text style={s.muted}>{children}</Text> }
export function Button({ title, onPress, secondary }) { return <Pressable onPress={onPress} style={[s.button, secondary && s.buttonSecondary]}><Text style={[s.buttonText, secondary && s.buttonTextSecondary]}>{title}</Text></Pressable> }
export function ListItem({ icon, title, subtitle, right, onPress }) { return <Pressable disabled={!onPress} onPress={onPress} style={s.list}><View style={s.icon}><Text style={{fontSize:19}}>{icon}</Text></View><View style={{flex:1}}><Text style={s.listTitle}>{title}</Text>{subtitle ? <Text style={s.muted}>{subtitle}</Text>:null}</View><Text style={s.listRight}>{right}</Text></Pressable> }
export function Progress({ value }) { return <View style={s.progress}><View style={[s.progressFill,{width:`${Math.max(0,Math.min(100,value))}%`}]} /></View> }
export const styles = s;

const s = StyleSheet.create({
  screen:{flex:1,backgroundColor:palette.bg,paddingTop:58,paddingHorizontal:18},
  kicker:{fontSize:12,color:palette.muted,fontWeight:'700',marginBottom:3},
  h1:{fontFamily:'Georgia',fontStyle:'italic',fontSize:30,color:'#684f5a',marginBottom:16,fontWeight:'700'},
  back:{color:'#956f7d',fontWeight:'800',fontSize:15,marginBottom:10},
  card:{backgroundColor:palette.white,borderWidth:1,borderColor:palette.line,borderRadius:22,padding:15,marginBottom:13},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
  muted:{color:palette.muted,fontSize:12},
  money:{fontWeight:'800',color:palette.ink,fontSize:15},
  moneyLarge:{fontFamily:'Georgia',fontWeight:'700',fontSize:34,color:palette.ink},
  button:{backgroundColor:palette.accent,borderRadius:16,paddingVertical:14,alignItems:'center',marginTop:8},
  buttonSecondary:{backgroundColor:palette.white,borderWidth:1,borderColor:palette.line},
  buttonText:{color:'#fff',fontWeight:'800'},
  buttonTextSecondary:{color:palette.ink},
  list:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#f4eaec'},
  icon:{width:40,height:40,borderRadius:14,backgroundColor:'#fff0f4',alignItems:'center',justifyContent:'center'},
  listTitle:{fontWeight:'700',color:palette.ink,fontSize:14},
  listRight:{fontWeight:'800',color:palette.ink,fontSize:13},
  progress:{height:9,backgroundColor:'#f3e9ec',borderRadius:99,overflow:'hidden',marginTop:8},
  progressFill:{height:'100%',backgroundColor:palette.accent,borderRadius:99}
});
