'use client'

import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar/searchbar';
import StarCard from '../components/StarCard/starcard';

export default function SearchPage() {
    const [searchKey, setSearchKey] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // this is temp right now
    const star = {
        starName : "Cas Summer",
        tier: 2
    }
    return (
        <main className='flex flex-col items-center pt-[100px] h-[80vh] gap-[40px]'>
            <SearchBar />
            <ul className='flex flex-col gap-4'>
                <li><StarCard star={star} /></li>
                <li><StarCard star={star} /></li>
                <li><StarCard star={star} /></li>
            </ul>
            
        </main>
    )
}