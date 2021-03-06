import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import data from '../../data/data.json';

import styles from './HomePage.module.scss';

export const HomePage: NextPage = () => {
    const { items } = data;

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>

                <p className={styles.description}>
                    Get started by editing{' '}
                    <code className={styles.code}>pages/index.tsx</code>
                </p>

                <div className={styles.grid}>
                    {items.map(item => (
                        <a
                            key={item.id}
                            href={item.wikiUrl}
                            className={styles.card}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <h2>{item.name}</h2>
                            <p>{item.caption}</p>
                        </a>
                    ))}

                </div>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            </span>
                </a>
            </footer>
        </div>
    );
};
