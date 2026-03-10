export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", ...(fullScreen ? { height:"100vh" } : { height:200 }) }}>
      <div style={{ width:28, height:28, border:"2px solid #1e3a1e", borderTopColor:"#7ab648", borderRadius:"50%", animation:"kla-spin 0.7s linear infinite" }} />
      <style>{`@keyframes kla-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
