import React from 'react'
import Link from 'next/link'
import { menuItems } from '../config/menu.config'
import { MenuList, MenuItem } from '@mui/material'
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {clsx} from 'clsx'
import styles from './Menu.module.css'
export default function Menu() {


    return (
        <div>

            <MenuList>
                {menuItems.map((item) => (
                    <MenuItem key={item.path}>
                        <ListItemIcon>{item.icon && <item.icon className={styles.listItemIcon} />}</ListItemIcon>
                        <ListItemText primary={<Link href={item.path}>{item.title}</Link>} />
                    </MenuItem>
                ))}
            </MenuList>
           
        </div>
    )
}