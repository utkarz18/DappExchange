interface Props {
    text: string;
}

const Banner = ({ text }: Props) => {
    return (
        <div className='banner'>
            <h1>{text}</h1>
        </div>
    );
}

export default Banner;