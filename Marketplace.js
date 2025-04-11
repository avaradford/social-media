// src/components/Marketplace.js
import React, { useState, useEffect } from 'react';
import './Marketplace.css';

function Marketplace({ account, falCoinContract, postManagerContract }) {
    const [marketplaceItems, setMarketplaceItems] = useState([]);
    const [newItem, setNewItem] = useState({
        itemType: 'mealswipe',
        quantity: 1,
        price: 0,
        description: ''
    });
    const [falCoinBalance, setFalCoinBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        const loadData = async () => {
            if (falCoinContract && postManagerContract) {
                await Promise.all([
                    loadMarketplaceItems(),
                    loadFalCoinBalance()
                ]);
                setLoading(false);
            }
        };

        loadData();
    }, [falCoinContract, postManagerContract]);

    const loadMarketplaceItems = async () => {
        try {
            const itemCount = await postManagerContract.methods.marketplaceItemCount().call();
            let itemsArray = [];

            for (let i = 1; i <= itemCount; i++) {
                const item = await postManagerContract.methods.marketplaceItems(i).call();
                if (item.isActive) {
                    itemsArray.push(item);
                }
            }

            setMarketplaceItems(itemsArray);
        } catch (error) {
            console.error("Error loading marketplace items:", error);
        }
    };

    const loadFalCoinBalance = async () => {
        try {
            const balance = await falCoinContract.methods.balanceOf(account).call();
            setFalCoinBalance(balance / (10 ** 18)); // Convert from wei
        } catch (error) {
            console.error("Error loading FalCoin balance:", error);
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await postManagerContract.methods.createMarketplaceItem(
                newItem.itemType,
                newItem.quantity,
                newItem.price * (10 ** 18) // Convert to wei
            ).send({ from: account });

            // Reset form and reload items
            setNewItem({
                itemType: 'mealswipe',
                quantity: 1,
                price: 0,
                description: ''
            });
            await loadMarketplaceItems();
        } catch (error) {
            console.error("Error creating marketplace item:", error);
        }
    };

    const handlePurchase = async (itemId, seller, price) => {
        try {
            // First approve the transfer
            await falCoinContract.methods.approve(
                postManagerContract._address,
                price
            ).send({ from: account });

            // Then complete transaction (this would be handled by a purchase function in the contract)
            // For this demo, we just simulate the transaction

            alert('Purchase successful!');

            // Reload data
            await Promise.all([
                loadMarketplaceItems(),
                loadFalCoinBalance()
            ]);
        } catch (error) {
            console.error("Error purchasing item:", error);
            alert('Transaction failed. Please try again.');
        }
    };

    const filterItems = (filter) => {
        setActiveFilter(filter);
    };

    const getFilteredItems = () => {
        if (activeFilter === 'all') return marketplaceItems;
        return marketplaceItems.filter(item => item.itemType === activeFilter);
    };

    if (loading) {
        return <div className="loading">Loading marketplace...</div>;
    }

    return (
        <div className="marketplace">
            <div className="marketplace-header">
                <h1>Bentley Marketplace</h1>
                <div className="user-balance">
                    <span>Your FalCoin Balance: {falCoinBalance.toFixed(2)} FAL</span>
                </div>
            </div>

            <div className="filter-tabs">
                <button
                    className={activeFilter === 'all' ? 'active' : ''}
                    onClick={() => filterItems('all')}
                >
                    All Items
                </button>
                <button
                    className={activeFilter === 'mealswipe' ? 'active' : ''}
                    onClick={() => filterItems('mealswipe')}
                >
                    Meal Swipes
                </button>
                <button
                    className={activeFilter === 'falcoin' ? 'active' : ''}
                    onClick={() => filterItems('falcoin')}
                >
                    FalCoins
                </button>
                <button
                    className={activeFilter === 'laundry' ? 'active' : ''}
                    onClick={() => filterItems('laundry')}
                >
                    Laundry Credits
                </button>
                <button
                    className={activeFilter === 'textbook' ? 'active' : ''}
                    onClick={() => filterItems('textbook')}
                >
                    Textbooks
                </button>
            </div>

            <div className="marketplace-container">
                <div className="create-item-form">
                    <h3>List New Item</h3>
                    <form onSubmit={handleCreateItem}>
                        <div className="form-group">
                            <label>Item Type</label>
                            <select
                                value={newItem.itemType}
                                onChange={(e) => setNewItem({...newItem, itemType: e.target.value})}
                            >
                                <option value="mealswipe">Meal Swipe</option>
                                <option value="falcoin">FalCoin</option>
                                <option value="laundry">Laundry Credit</option>
                                <option value="textbook">Textbook</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (FAL)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newItem.price}
                                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={newItem.description}
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                placeholder="Add details about your listing..."
                            />
                        </div>

                        <button type="submit" className="create-button">List Item</button>
                    </form>
                </div>

                <div className="items-grid">
                    {getFilteredItems().length === 0 ? (
                        <div className="no-items">No items available in this category.</div>
                    ) : (
                        getFilteredItems().map(item => (
                            <div className="item-card" key={item.id}>
                                <div className="item-type">
                                    {item.itemType === 'mealswipe' && '🍽️ Meal Swipe'}
                                    {item.itemType === 'falcoin' && '🪙 FalCoin'}
                                    {item.itemType === 'laundry' && '🧺 Laundry Credit'}
                                    {item.itemType === 'textbook' && '📚 Textbook'}
                                    {item.itemType === 'other' && '📦 Other'}
                                </div>

                                <div className="item-details">
                                    <span className="item-quantity">Qty: {item.quantity}</span>
                                    <span className="item-price">{item.price / (10 ** 18)} FAL</span>
                                </div>

                                <div className="item-seller">
                                    Seller: {item.seller.substring(0, 6)}...{item.seller.substring(38)}
                                </div>

                                {item.seller.toLowerCase() !== account.toLowerCase() && (
                                    <button
                                        className="purchase-button"
                                        onClick={() => handlePurchase(item.id, item.seller, item.price)}
                                    >
                                        Purchase
                                    </button>
                                )}

                                {item.seller.toLowerCase() === account.toLowerCase() && (
                                    <button className="your-listing-button" disabled>
                                        Your Listing
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Marketplace;