package com.hiresync.config;

import com.hiresync.entity.Role;
import com.hiresync.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {
    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = user.getRole().name();
        return List.of(
            new SimpleGrantedAuthority(roleName),
            new SimpleGrantedAuthority("ROLE_" + roleName),
            new SimpleGrantedAuthority(user.getRole() == Role.JOB_SEEKER ? "CANDIDATE" : "RECRUITER")
        );
    }

    @Override
    public String getPassword() { return user.getPassword(); }

    @Override
    public String getUsername() { return user.getEmail(); }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
    
    public User getUser() { return user; }
}
