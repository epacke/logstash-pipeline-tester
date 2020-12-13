
console.log(process.env.NODE_ENV);

export default process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '';
