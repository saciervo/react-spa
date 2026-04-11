import { Link } from "react-router-dom"
import { GettingStarted, AutoUis, ReactLogo } from 'react-net-templates'
import Layout from "@/components/Layout"
import SrcPage from "@/components/SrcPage"
import FeatureLinks from "@/components/FeatureLinks"

const Index = () => {
    return (
        <Layout title="React SPA with Vite + TypeScript">
            <div className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
                        <span className="block xl:inline">Welcome to </span>
                        <span className="block text-link-dark dark:text-link-dark xl:inline">React SPA</span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                        Welcome to your new React SPA App
                    </p>
                    <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
                        <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                            <Link to="https://react.servicestack.net"
                                className="flex w-full items-center justify-center rounded-md border border-transparent bg-link-dark dark:bg-link-dark px-8 py-3 text-base font-medium text-white hover:bg-gray-700 md:py-4 md:px-10 md:text-lg">
                                React Component Gallery
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-8 flex">
                <div className="mt-8 mx-auto">
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl text-center">
                        Getting Started
                    </h2>
                    <div>
                        <GettingStarted template="react-spa"
                            templateName="React SPA"
                            logo={<ReactLogo className="size-12" />}
                            runLabel="Run .NET and Vite" />
                    </div>
                </div>
            </section>

            <AutoUis className="mt-40 max-w-7xl mx-auto" />

            <FeatureLinks />

            <div className="my-8 flex justify-center gap-x-4">
                <SrcPage path="index.tsx" />
            </div>

        </Layout>
    )
}

export default Index
