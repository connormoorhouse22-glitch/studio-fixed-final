
function Error({ statusCode }: { statusCode?: number }) {
  return <p>{statusCode ? `Error ${statusCode} on server` : 'Error on client'}</p>;
}
Error.getInitialProps = ({ res, err }: { res?: any, err?: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
export default Error;
