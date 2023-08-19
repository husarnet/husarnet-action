# Husarnet VPN Action for GitHub Actions

Connecting your GitHub workflow to Husarnet peer-to-peer VPN network. Useful for deployment to hosts that don't have a public nor static IP address.

## Usage

```yaml
name: Ping other peer from a VPN network

on: push

jobs:
  build:
    runs-on: ubuntu-20.04
    steps:

    - name: Connecting to Husarnet VPN network
      uses: husarnet/husarnet-action@v3
      with:
        join-code: ${{ secrets.HUSARNET_JOINCODE }}

    - name: Ping other peer
      run: ping6 -c 10 my-laptop

```

## Inputs

```yaml
    - name: Husarnet VPN
      uses: husarnet/husarnet-action@v3
      with:
        join-code: ${{ secrets.HUSARNET_JOINCODE }}
        hostname: my-hostname
        remove-host: yes
        dashboard-login: ${{ secrets.HUSARNET_DASHBOARD_LOGIN }}
        dashboard-password: ${{ secrets.HUSARNET_DASHBOARD_PASSWORD }}
```

| input | required | default value | description |
| - | - | - | - |
| `join-code` | yes |  | A Join Code for the Husarnet network you want to connect to. Find your Join Code at https://app.husarnet.com/  |
| `hostname` | no | `github-actions-<repo name>` | A hostname under which this workflow will be available in your Husarnet network |
| `remove-host` | no | `true` | After the end of the workflow remove the Husarnet host (peer) associated with the GitHub workflow. To do so you **HAVE TO** set `dashboard-login` and `dashboard-password` inputs |
| `dashboard-login` | no |  | A login to your account at https://app.husarnet.com |
| `dashboard-password` | no |  |A password to your account at https://app.husarnet.com |

## Outputs

```yaml
    - name: Husarnet VPN
      id: husarnet
      uses: husarnet/husarnet-action@v4
      with:
        join-code: ${{ secrets.HUSARNET_JOINCODE }}
        hostname: my-hostname
    
    - name: Print IPv6
      run: echo My IPv6 addr is ${{ steps.husarnet.outputs.ipv6 }}
```

| output | description |
| - | - |
| `ipv6` | Husarnet IPv6 address of the peer |
