import { LockClosedIcon } from '@heroicons/react/solid'
import { useEffect, useState    } from 'react';

const dev = process.env.NODE_ENV !== 'production';
const API_ENDPOINT = dev ? "http://localhost:3000/api/ban" : "https://nextjs-joaquin-materialize.vercel.app/api/ban";

export default function Ban() {
    const [{ data: banTime, loading }, setBan] = useState({
        data: undefined,
        loading: true,
        error: undefined,
    });
    const [{ data: IPv4 }, setIP] = useState({
        loading: true,
        data: undefined,
        error: undefined,
    });
    const [timedown, setTimedown] = useState("");

    useEffect(() => {
        if (banTime) {
            var timer = banTime, minutes, seconds;
            const intervalId = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                setTimedown(minutes + ":" + seconds);

                if (--timer < 0) {
                    window.location.reload();
                }
            }, 1000);

            return () => {
                clearInterval(intervalId);
            }
        }
    }, [banTime]);

    useEffect(() => {
        const asyncRequest = async () => {
            const { IPv4 } = await (await fetch('https://geolocation-db.com/json/')).json();
            setIP({
                loading: false,
                data: IPv4,
                error: undefined,
            });
        }

        asyncRequest();
    }, []);

    useEffect(() => {
        if (IPv4) {
            const asyncRequest = async () => {
                const fetchReq = await fetch(`${API_ENDPOINT}/?IPv4=${IPv4}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                });

                if (fetchReq.status === 200) {
                    setBan({
                        data: false,
                        loading: false,
                        error: undefined,
                    });
                } else if (fetchReq.status === 401) {
                    const row = await fetchReq.json();
                    const [ip, banTime] = row;

                    setBan({
                        data: banTime / 1000,
                        loading: false,
                        error: undefined,
                    });
                } else {
                    setBan({
                        data: false,
                        loading: false,
                        error: "Error",
                    });
                }
            }

            asyncRequest();
        }
    }, [IPv4])

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        try {
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                    IPv4,
                }),
            }).then(() => {
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Apply the super ban</h2>
            </div>
                <div>
                <button
                    onClick={handleOnSubmit}
                    type="submit"
                    className={`${(banTime || loading) && "cursor-not-allowed"} group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    disabled={banTime || loading}
                >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                    </span>
                    Apply Ban
                </button>
                {banTime && (
                <div className='mt-10 text-center '>
                    <p className={"text-red-500"}>Your IP is already banned.</p>
                    <p className={"mt-2 text-gray-400"}>{`Remaining time: ${timedown}`}</p>
                </div>
                )}
                </div>
            </div>
        </div>
        </>
    );
}
